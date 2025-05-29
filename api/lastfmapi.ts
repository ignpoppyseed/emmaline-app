import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosResponse } from 'axios';
// import fetch from 'node-fetch';
const api_key = process.env.LAST_FM;

const get_artist_url_from_song_url = function f(url: string): string {
    const second_to_last_index = url.lastIndexOf('/', url.lastIndexOf('/') - 1);
    if (second_to_last_index !== -1) { return url.substring(0, second_to_last_index); }
    return url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    let last_fm_res: AxiosResponse | null = null;
    let musicbrainz_res: AxiosResponse | null = null;
    var response_data = {}
    var req_type = req.query.req_type
    if (req_type == undefined) { return res.json({message: `no input!`,}) }
    req_type = req_type.toString().toLowerCase()
    if (req_type == 'top_artist') { 
        axios('https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=xpoppyseed&api_key='+ api_key +'&format=json&period=1month&limit=1')
        .then( (response) => {
            var api = response.data
            return res.json({
                image: api.topartists.artist[0].image[2]['#text'],
                artist_name: api.topartists.artist[0].name,
                plays: api.topartists.artist[0].playcount,
                last_fm_url: api.topartists.artist[0].url,
            })
        }).catch( (error) => {
            var rere = error
            return res.json(rere)
        })
    }
    else if (req_type == 'top_song') { 
        axios('https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=xpoppyseed&api_key='+ api_key +'&format=json&period=1month&limit=1')
        .then( (response) => {
            var api = response.data
            return res.json({
                image: api.toptracks.track[0].image[2]['#text'],
                artist_name: api.toptracks.track[0].artist.name,
                song_name: api.toptracks.track[0].name,
                plays: api.toptracks.track[0].playcount,
                last_fm_url: api.toptracks.track[0].url,
            })
        }).catch( (error) => {
            var rere = error
            return res.json(rere)
        })
    }
    // else if (req_type == 'recent_song') { 
    //     axios('https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=xpoppyseed&api_key='+ api_key +'&format=json&period=1month&limit=1')
    //     .then( (response) => {
    //         var api = response.data
    //         console.log(api.recenttracks.track[0])
    //         last_fm_res = response.data
    //         return res.json({
    //             image: api.recenttracks.track[0].image[2]['#text'],
    //             artist_name: api.recenttracks.track[0].artist.name,
    //             song_name: api.recenttracks.track[0].name,
    //             plays: api.recenttracks.track[0].playcount,
    //             last_fm_url: api.recenttracks.track[0].url,
    //         })
    //     }).catch( (error) => {
    //         var rere = error
    //         return res.json(rere)
    //     })
    // }
    else if (req_type == 'recent_song') { 
        await axios('https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=xpoppyseed&api_key='+ api_key +'&format=json&period=1month&limit=1').then( (response) => { last_fm_res = response }).catch( (error) => { return res.json(error) })

        var api = last_fm_res!.data

        var album_image = ''

        var mbid = api.recenttracks.track[0].album.mbid
        if (mbid == null || mbid == undefined || mbid == '') {
            album_image = 'https://picsum.photos/512'
        } else {
            await axios('https://coverartarchive.org/release/'+api.recenttracks.track[0].album.mbid).then( (response) => { musicbrainz_res = response }).catch( (error) => { musicbrainz_res = error })
            // console.log(musicbrainz_res!.status)
            if (musicbrainz_res!.status == undefined) {
                album_image = 'https://picsum.photos/512'
            } else {
                var mb_res = musicbrainz_res!.data
                album_image = mb_res.images[0].image.replace('http://', 'https://')
            }
        }
        try { 
            api.recenttracks.track[0]['@attr'].nowplaying 
            var now_playing = true
        }
        catch { var now_playing = false }

        

        response_data = {
            // image: api.recenttracks.track[0].image[2]['#text'],
            image: album_image,
            artist_name: api.recenttracks.track[0].artist['#text'],
            song_name: api.recenttracks.track[0].name,
            now_playing: now_playing,
            song_last_fm_url: api.recenttracks.track[0].url,
            artist_last_fm_url: get_artist_url_from_song_url(api.recenttracks.track[0].url),
        }
        // console.log(api.recenttracks.track[0])
        // return res.json(response_data)
        return res.json(response_data)
    }
    else if (req_type == 'top_album_month') { 
        await axios('https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=xpoppyseed&api_key='+ api_key +'&format=json&period=1month&limit=1').then( (response) => { last_fm_res = response }).catch( (error) => { return res.json(error) })

        var api = last_fm_res!.data

        var album_image = ''

        var mbid = api.topalbums.album[0].mbid
        if (mbid == null || mbid == undefined || mbid == '') {
            album_image = 'https://picsum.photos/512'
        } else {
            await axios('https://coverartarchive.org/release/'+api.topalbums.album[0].mbid).then( (response) => { musicbrainz_res = response }).catch( (error) => { musicbrainz_res = error })
            // console.log(musicbrainz_res!.status)
            if (musicbrainz_res!.status == undefined) {
                album_image = 'https://picsum.photos/512'
            } else {
                var mb_res = musicbrainz_res!.data
                album_image = mb_res.images[0].image.replace('http://', 'https://')
            }
        }

        response_data = {
            // image: api.recenttracks.track[0].image[2]['#text'],
            image: album_image,
            artist_name: api.topalbums.album[0].artist.name,
            album_name: api.topalbums.album[0].name,
            playcount: api.topalbums.album[0].playcount,
            album_last_fm_url: api.topalbums.album[0].url,
            artist_last_fm_url: api.topalbums.album[0].artist.url,
        }
        // console.log(api.recenttracks.track[0])
        // return res.json(response_data)
        return res.json(response_data)
    }
    else if (req_type == 'top_album_week') { 
        await axios('https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=xpoppyseed&api_key='+ api_key +'&format=json&period=7day&limit=1').then( (response) => { last_fm_res = response }).catch( (error) => { return res.json(error) })

        var api = last_fm_res!.data

        var album_image = ''

        var mbid = api.topalbums.album[0].mbid
        if (mbid == null || mbid == undefined || mbid == '') {
            album_image = 'https://picsum.photos/512'
        } else {
            await axios('https://coverartarchive.org/release/'+api.topalbums.album[0].mbid).then( (response) => { musicbrainz_res = response }).catch( (error) => { musicbrainz_res = error })
            // console.log(musicbrainz_res!.status)
            if (musicbrainz_res!.status == undefined) {
                album_image = 'https://picsum.photos/512'
            } else {
                var mb_res = musicbrainz_res!.data
                album_image = mb_res.images[0].image.replace('http://', 'https://')
            }
        }

        response_data = {
            // image: api.recenttracks.track[0].image[2]['#text'],
            image: album_image,
            artist_name: api.topalbums.album[0].artist.name,
            album_name: api.topalbums.album[0].name,
            playcount: api.topalbums.album[0].playcount,
            album_last_fm_url: api.topalbums.album[0].url,
            artist_last_fm_url: api.topalbums.album[0].artist.url,
        }
        // console.log(api.recenttracks.track[0])
        // return res.json(response_data)
        return res.json(response_data)
    }
    else if (req_type == 'recent_song_example') { 
        return res.json({"image":"https://picsum.photos/512","artist_name":"Freddie Dredd","song_name":"LIMBO","now_playing":false,"last_fm_url":"https://www.last.fm/music/Freddie+Dredd/_/LIMBO"})
    }
}

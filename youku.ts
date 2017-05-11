import {Video, VideoCollection} from '../../ts/Model/resource';
import {ISearchAdapter, IClassifiedVideoAdapter} from '../../ts/Model/res-adapter';

const Youku = require('youku-client');

module.exports = vcapi => {
    const {Video, VideoCollection} = vcapi
    
    class YoukuAdapter implements ISearchAdapter, IClassifiedVideoAdapter {
        constructor() {
            this.get_detail = this.get_detail.bind(this)
        }

        static client_id = 'd69a5ea43a68899c9'
        static client_secret = 'kfd2606fc758a3f55fc61ee06fdc4d451'

        async search_show(name: string, page: number, count?: number): Promise<VideoCollection[]> {
            return new Promise<VideoCollection[]>((fulfill, reject) => {
                this.client.get('searches/show/by_keyword', {
                    keyword: name,
                    unite: 1,
                    page: page,
                    count: count
                }, function(err, video: SearchShowResult, resp) {
                    console.log("err:", err);
                    console.log("video:", video);
                    console.log("resp:", resp);
                    if (err) {
                        reject(err)
                    }
                    let videos:VideoCollection[] = []
                    for (var v of video.shows) {
                        let newv:VideoCollection = new VideoCollection()
                        newv.name = v.name
                        newv.poster = v.bigPoster
                        newv.url = v.link
                        newv.raw = v
                        newv.plugin = 'vc-youku-plugin'
                        videos.push(newv)
                    }
                    fulfill(videos)
                });           
            });
        }
        async search_album(name: string, page: number, count?: number): Promise<VideoCollection[]> {
            return null
        }

        async search_video(name: string, page: number, count?: number): Promise<Video[]> {
            return new Promise<Video[]>((fulfill, reject) => {
                this.client.get('searches/video/by_keyword', {
                    keyword: name,
                    page: page,
                    count: count
                }, function(err, video: SearchShowResult, resp) {
                    if (err) {
                        reject(err)
                    }
                    let videos:Video[] = []
                    for (var v of video.shows) {
                        let newv = new Video()
                        newv.name = v.name
                        newv.thumbnail = v.bigThumbnail
                        newv.url = v.play_link
                        newv.raw = v
                        videos.push(newv)
                    }
                    console.log(video);
                    fulfill(videos)
                });           
            });
        }

        public async get_detail(raw: YoukuVideo) {

        } 

        public async get_video(classname: string, page: number, count?: number):Promise<Video[]> {
            return null
        }

        public async get_album(classname: string, page: number, count?: number):Promise<VideoCollection[]> {
            return null
        }

        public async get_show(classname: string, page: number, count?: number):Promise<VideoCollection[]> {
            return new Promise<VideoCollection[]>((resolve, reject) => {
            let genre = this.classMap[classname] 
            if (genre == null) throw 'no class'
            let ret:VideoCollection[] = []
            this.client.get('searches/show/top_unite', {
                    category: classname.split('/')[0],
                    genre: genre,
                    headnum: 5,
                    tailnum: 5,
                    page: page,
                    count: count
                }, function(err, video, resp) {
                    if (err) {
                        reject(err)
                    }
                    let videos:VideoCollection[] = []
                    for (var v of video.data) {
                        let newv:VideoCollection = new VideoCollection()
                        newv.name = v.name
                        newv.poster = v.vpic
                        newv.url = v.play_link
                        newv.raw = v
                        videos.push(newv)
                    }
                    console.log(video);
                    resolve(videos)
                });        
            return ret
            })
        }

        client = new Youku({
            client_id: YoukuAdapter.client_id.substr(1),
            client_secret: YoukuAdapter.client_secret.substr(1)
        });

        private classMap = {
            '电影/全部': 0, '电影/喜剧': 2001, '电影/爱情': 2003, '电影/恐怖': 2004, '电影/动作': 2002,'电影/科幻': 2007,'电影/战争': 2008,'电影/警匪': 2012, '电影/犯罪': 2005, '电影/动画': 2009,'电影/奇幻': 2013,'电影/其他': 2111,
            '电视剧/全部': 0, '电视剧/古装': 1007, '电视剧/警匪': 1009, '电视剧/搞笑': 1010, '电视剧/悬疑': 1011, '电视剧/神话': 1012, '电视剧/偶像': 1001, '电视剧/历史': 1005, '电视剧/言情': 1002, '电视剧/家庭': 1013, '电视剧/科幻': 1014, '电视剧/其他': 1111,
            '动漫/全部': 0, '动漫/搞笑': 5011, '动漫/恋爱': 5007, '动漫/热血': 5002, '动漫/格斗': 5006, '动漫/美少女': 5010, '动漫/魔法': 5012, '动漫/机战': 5013, '动漫/校园': 5005, '动漫/少儿': 5014, '动漫/冒险': 5015, '动漫/真人': 5001, '动漫/萝莉': 5008, '动漫/其他': 5111,
            '综艺/全部': 0, '综艺/脱口秀': 3001, '综艺/真人秀': 3002, '综艺/选秀': 3003, '综艺/美食': 3004, '综艺/旅游': 3005, '综艺/汽车': 3006, '综艺/访谈': 3007, '综艺/纪实': 3008, '综艺/搞笑': 3009, '综艺/其他': 3111
        }
    }

    let inst = new YoukuAdapter()
    return {
        search_adapter: inst,
        classified_video_adapter: inst,
        resource: {
            '电影': ['全部', '喜剧', '爱情', '恐怖', '动作', '科幻', '战争', '警匪', '犯罪', '动画', '奇幻', '其他'],
            '电视剧': ['全部', '古装', '警匪', '搞笑', '悬疑', '神话', '偶像', '历史', '言情', '家庭', '科幻', '其他'],
            '动漫': ['全部', '搞笑', '恋爱', '热血', '格斗', '美少女', '魔法', '机战', '校园', '少儿', '冒险', '真人', '萝莉', '其他'],
            '综艺': ['全部', '脱口秀', '真人秀', '选秀', '美食', '旅游', '汽车', '访谈', '纪实', '搞笑', '其他']
        }
    }
}


interface SearchShowResult {
    shows: YoukuVideo[]
    total: string // 总共个数
}

interface YoukuVideo {
    bigPoster: string       // 纵向海报
    bigThumbnail: string    // 横向截屏
    completed: number       // 是否完结
    description: string     // 描述
    episode_count: string   // 总共的剧集
    episode_updated: string // 最新剧集
    episodes: any[]         // 剧集资源
    hasvideotype: string[]  // 视频类型（正片，预告，资讯，首映式等）
    id: string              // Youku内唯一ID
    link: string            // 剧集链接
    name: string            // 视频名
    paid: number            // 是否需要付费
    play_link: string       // 播放链接
    poster: string          // 小海报
    published: string       // 发布时间
    score: string           // 得分
    showcategory: string    // 类型（电视剧，电影等）
    streamtypes: string[]   // 数据类型（hd2，flv）等
    thumbnail: string       // 小截图
    view_count: string      // 观看次数
}


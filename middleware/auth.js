const {User} = require('../models/User')

let auth = (req, res, next) => {

// 인증처리 하는 곳
// 클라이언트 쿠키에서 토큰을 가져옴
let token = req.cookies.x_auto;

// 복호화 하여 user_id와 비교 (findByToken은 user에다 새로 만든 메소드)
User.findByToken(token,(err,user) => {
    if(err) throw err;
    if(!user) return res.json({ isAuth: false, error: true})

    req.token = token;
    req.user = user;
    next()
})

// 유져가 있으면 인증

// 유저가 없으면 인증 no!!

}

module.exports = {auth}
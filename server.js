const express = require('express');
const mongoose = require('mongoose')
const server = express();
const User = require('./models/User')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {auth} = require('./middleware/auth')
//.env 파일에서 직접 path값을 받아오기 {아래의 코드를 사용한다면 process.env.MONGODB_URL 로 사용, variables.env파일 참조}
// require('dotenv').config({ path: 'variables.env' })


// 개발과 프로덕션 환경을 구분하여 환경 변수 설정
const config = require('./config/key')


// url분석
server.use(bodyParser.urlencoded({extended: true}))

// json 타입 분석
server.use(bodyParser.json())
// cookie 타입 분석
server.use(cookieParser())

server.get('/',(req,res)=>{
    res.redirect('https://mrlogin.io/auth/kakao/handler')
    // res.sendFile(__dirname + '/index.html')
    // const newUser = new User();
    // newUser.email = 'pztdrd1@naver.com'
    // newUser.name = '김구구'
    // newUser.age = 45
    // newUser.save().then(user => {
    //         console.log(user,'완성')
    //         res.json({
    //             message: 'User Created Successfully'
    //         });
    //     }).catch(err => {
    //         res.json({
    //             message: 'User was not Successfully created'
    //         })
    //         console.log(err,'error')
    //     })
})

server.post('/api/user/register', (req,res) => {
    //회원 가입 
    //bodyParser로 가져온 req.body
    const user = new User(req.body)
    //이건 몽구스 함수(저장)
    user.save(( err, userInfo) => {
        if(err) return res.json({ success: false, err})
        //200은 성공코드
        return res.status(200).json({
            success: true
        })
    })
})

server.post('/api/user/login', (req,res) => {
    // 요청된 이메일이 데이터 베이스에 있는지 확인 (findOne은 몽고DB함수)
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({ 
                loginSuccess: false,
                message: '가입되지 않은 이메일 주소 입니다.'
            })
        }

    // 요청된 이메일이 데이터 베이스에 있다면, 비밀번호가 동일한지 확인
    user.comparePassword( req.body.password, (err, isMatch) => {
        if(!isMatch)
            return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다.'});
        
            // 비밀번호까지 맞다면, 토큰을 생성하기
            
        user.generateToken((err, user, to1) => {
            if(err) return res.status(400).send(err);
            if(to1 === 2) return res.status(400).json({ message: '됐다'})
            // 토큰을 저장한다. (쿠키, 로컬스토리지, 세션 등...) 일단 쿠키에 저장 , 쿠키파서 설치
            res.cookie('x_auth',user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// 미들웨어 auth 추가 //서버 요청전에 처리해줄 내용
server.get('/api/user/auth', auth ,(req,res)=>{

    // 여기까지 왔다는 것은 Authentication이 true라는 것
    // 미들웨어에서 req로 user와 token을 전달함
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 1 ? true : false,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        image: req.user.image,
    })
})


server.listen(3000,(err)=>{
    if(err) {
        return console.log(err,'server err!!!!');
    }
    else {
        mongoose.connect(config.MONGODB_URL, { useNewUrlParser:true }, (err) => {
            if(err) {
                console.log('몽고DB에러')
            } else {
                console.log('Connected to database successfully')
            }
        })
    }
});
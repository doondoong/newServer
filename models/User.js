const mongoose = require('mongoose');
const {Schema} = mongoose

//bcrypt 라이브러리 사용
const bcrypt = require('bcrypt');

//암호할 키값이 몇글자 인지 설정
const saltRounds = 10;

//jwt
const jwt = require('jsonwebtoken');


const userSchema = new Schema({
    name: {
        type: String, 
        maxlength: 30,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        //유일값
        unique: true,
    },
    password: {
        type: String,
        //공백제거
        trim: true,
        //필수값
        required: true,
    },
    age:{
        type: Number,
        min: 18,
        max: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    }
}, {
    timestamps: true
})

//이것도 몽구스꺼(몽구스 저장전에 스키마에서 처리할 내용) next함수로 서버 라우터로 이동시킴
userSchema.pre('save', function(next){

    //전달 받은 유저의 비밀번호(위에있는 스키마)
    let user = this

    //모델안의 패스워에 변경이 있을 경우에만 암호화 한다(isModified는 변경을 체크하는 함수?)
    if(user.isModified('password')) {
         //비밀번호 암호화
    bcrypt.genSalt(saltRounds,function(err,salt){
        if(err) return next(err) 
        // 전달받은 비밀번호와 salt(키)값을 이용하여 hash를 만드는 함수
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)
            //유저의 패스워드를 해쉬값으로 변경하여 출력
            user.password = hash
            next()
        })
    })
    } else {
        next()
    }
})

// 아래의 'comparePassword' 변경가능 / 입력한 비밀번호를 비교하는 메소드
userSchema.methods.comparePassword = function(plainPassword, cb) {
    // plainPassword = '1234' 와 암호화된 비밀번호가 같은지 체크
    bcrypt.compare(plainPassword, this.password, function(err,isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    //jwt 토큰 생성
    var user = this;
    var token = jwt.sign(user._id.toHexString(),'secretToken')
    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null, user)
    })
}

// 다른 곳에서 사용 가능하도록 모델을 expoert 해줌
module.exports = mongoose.model('User', userSchema)
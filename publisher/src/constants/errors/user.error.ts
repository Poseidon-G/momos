import { CustomErrorInterface } from "../../interfaces/custom-error.interface";


const UserAlreadyExistsWithThisEmail: CustomErrorInterface = {
    errorCode: 'E2000',
    statusCode: 400,
    message: 'User already exists with this email',
    locale: {
        en: 'User already exists with this email',
        vi: 'Người dùng đã tồn tại với email này'
    }
};

const UserNotFound: CustomErrorInterface = {
    errorCode: 'E2001',
    statusCode: 404,
    message: 'User not found',
    locale: {
        en: 'User not found',
        vi: 'Không tìm thấy người dùng'
    }
};

const UserPasswordNotMatch: CustomErrorInterface = {
    errorCode: 'E2002',
    statusCode: 400,
    message: 'Password not match',
    locale: {
        en: 'Password not match',
        vi: 'Mật khẩu không khớp'
    }
};

export default {
    UserAlreadyExistsWithThisEmail,
    UserNotFound,
    UserPasswordNotMatch
}
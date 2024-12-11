import { CustomErrorInterface } from "../../interfaces/custom-error.interface"
import MediaError from './media.error'
import UserError from './user.error'


const InternalSystemError: CustomErrorInterface = {
    errorCode: 'E0000',
    statusCode: 500,
    message: 'An unexpected internal error occurred.',
    locale: {
        en: 'An unexpected internal error occurred.'
    }
}

const BadRequest: CustomErrorInterface = {
    errorCode: 'E1000',
    statusCode: 400,
    message: 'Bad request',
    locale: {
        en: 'Bad request'
    }
}

const ValidationFailed: CustomErrorInterface = {
    errorCode: 'E1001',
    statusCode: 400,
    message: 'Validation failed',
    locale: {
        en: 'Validation failed'
    }
}

const UnAuthorizedRequest: CustomErrorInterface = {
    errorCode: 'E1002',
    statusCode: 401,
    message: 'Unauthorized request',
    locale: {
        en: 'Unauthorized request'
    }
}

const ForbiddenRequest: CustomErrorInterface = {
    errorCode: 'E1003',
    statusCode: 403,
    message: 'Forbidden request',
    locale: {
        en: 'Forbidden request'
    }
}

const NotFound: CustomErrorInterface = {
    errorCode: 'E1004',
    statusCode: 404,
    message: 'Resource not found',
    locale: {
        en: 'Resource not found'
    }
}

export default {
    InternalSystemError,
    BadRequest,
    ValidationFailed,
    UnAuthorizedRequest,
    ForbiddenRequest,
    NotFound,
    ...MediaError,
    ...UserError
}
import {AppError} from '../types/types';
class GenError {
    errorAction: string;
    errorCode:number
    errorMessage:string
    errorType:string
    errorLabel:string
    constructor(error:AppError) {

        this.errorAction = error.errorAction;
        this.errorCode = error.errorCode;
        this.errorMessage = error.errorMessage;
        this.errorType = error.errorType;
        this.errorLabel = error.errorLabel;
    }
      sendError() {
        return {
            errorCode: this.errorCode,
            errorLabel: this.errorLabel,
            errorType: this.errorType,
            errorAction: this.errorAction,
            errorMessage: this.errorMessage
        };
    };
}

export default GenError
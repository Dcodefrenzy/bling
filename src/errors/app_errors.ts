import GenError from './errors'


export const postRequestError = (err:any) => {
        let label:string;
        if (err.isJoi === true) {
               const e: any = err.details[0];
            label = e.context.label;   
        }else{
            label = err.label;
        }

    let e = {
                errorCode:400,
                errorLabel:label, 
                errorMessage:err.message,
                errorType:"Bad Request",
                errorAction:"CREATE"

            }
    const error = new GenError(e);
    
    return error.sendError();
}


export const updateRequestError = (err:any) => {
    let label:string;
    if (err.isJoi === true) {
           const e: any = err.details[0];
        label = e.context.label;   
    }else{
        label = err.label;
    }

    let e = {
                errorCode:400,
                errorLabel:label, 
                errorMessage:err.message,
                errorType:"Bad Request",
                errorAction:"UPDATE"
            }
            const error = new GenError(e);
    return error.sendError();
}

export const getParamRequestError =  (err:any) => {
    
    let e = {
                errorCode:400,
                errorLabel:err.context.label, 
                errorMessage:err.message,
                errorType:"Bad Request",
                errorAction:"PEEK"
            }
    const error = new GenError(e);
    return error.sendError();
}


export const deleteRequestError =  (err:any) => {
    
    let e = {
                errorCode:400,
                errorLabel:err.context.label, 
                errorMessage:err.message,
                errorType:"Bad Request",
                errorAction:"DELETE"
            }
            const error = new GenError(e);
            return error.sendError();
}


export const requestNotFoundError = (err:any) => {
    
    let e = {
                errorCode:404,
                errorLabel:err.label, 
                errorMessage:`${err.label}_not_found`,
                errorType:"Not Found",
                errorAction:"PEEK"
            }
            const error = new GenError(e);
            return error.sendError();
}

export const duplicateRequestError = (err:any)=>{
        
    let e = {
        errorCode:409,
        errorLabel:err.label, 
        errorMessage:`${err.label}_exist`,
        errorType:"Duplicate Value",
        errorAction:"PEEK"
    }

    const error = new GenError(e);
    return error.sendError();
}

export const incorrectRequestError = (err:any)=>{
        
    let e = {
        errorCode:409,
        errorLabel:err.label, 
        errorMessage:`${err.label}_is_incorrect`,
        errorType:"Incorrect Value",
        errorAction:"PEEK"
    }

    const error = new GenError(e);
    return error.sendError();
}


export const accessRequestError = (err:any)=>{
        
    let e = {
        errorCode:401,
        errorLabel:err.label, 
        errorMessage:`unauthorised_to_${err.action}_${err.label}`,
        errorType:"Unauthorised Access",
        errorAction:err.action
    }

    const error = new GenError(e);
    return error.sendError();
}
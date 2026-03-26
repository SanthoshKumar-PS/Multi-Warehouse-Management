import ApiError from '../../../utils/ApiError'
type ValidateLoginTrigramType = {trigram:string,password:string}

export const validateLoginTrigram = ({trigram, password}: ValidateLoginTrigramType) => {
    if(!trigram || !password){
        console.log("Missing trigram or password.");
        throw new ApiError(403,'Missing trigram or password.')
    }
}



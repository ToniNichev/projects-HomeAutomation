import { 
    registerUser,
    logIn,
    logOut,
    updateUser,
} from './services';

const stringToObject = (str) => {
    const fullString = str == '' ? '[]' : '[' + str.split('][').join('],[') + ']';
    return JSON.parse(fullString);
}



const UserServices = async (req, res, usersData) => {
    const action = req.params[0];

    
    switch(action) {
        case 'register-user':
            await registerUser(req, res);
            break;
        case 'log-in':
            await logIn(req, res, usersData);
            break;   
            case 'log-out':
                await logOut(req, res, usersData);
                break;               
        case 'update-user':
            await updateUser(req, res, usersData);
    }
}

export default UserServices;
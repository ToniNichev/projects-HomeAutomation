import { getLocalWeather} from './services';

const weatherServices = async (req, res) => {
    const action = req.params[0];
    switch(action) {
        case 'get-local-weather':
            await getLocalWeather(req, res);
            break;
    }
}

export default weatherServices;
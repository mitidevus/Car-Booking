import axios from 'axios';

export class LocationPlugin {
    async getLocationFromAddress(address) {
        // This method will be implemented by child classes
    }
}

export class GoogleMapsLocationPlugin extends LocationPlugin {
    async getLocationFromAddress(address) {
        try {
            console.log('API START');
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_API_KEY}`
            );
            console.log('API DONE', response.data);
            const data = response.data;
            if (data.status === 'OK') {
                const result = data.results[0];
                const location = result.geometry.location;
                return location;
            }
        } catch (error) {
            console.error('Error getting location from address:', error);
        }
    }
}

export default class VietBanDoLocationPlugin extends LocationPlugin {
    // Implement method to get location from address using VietBanDo API
}

export class PluginManager {
    static plugins = {
        google_maps: new GoogleMapsLocationPlugin(),
        vietbando: new VietBanDoLocationPlugin()
    };

    static getPlugin(pluginName) {
        return this.plugins[pluginName];
    }
}

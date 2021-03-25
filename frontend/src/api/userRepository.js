import axios from "axios";

export class UserRepository {
    url = 'http://localhost:8000';
    // url = 'http//3.21.114.143:8000'; // switch to cloud once pulled
    config = {};

    // get all the users
    getUsers(params) {
        return new Promise((resolve, reject) => {
            if (params) {
                let config = this.config;
                config.params = params;
            }
            axios.get(`${this.url}/getit/users`, this.config)
                .then(x => resolve(x.data))
                .catch(e => {
                    alert("catch error when getting users");
                    reject();});
        });
    }


    // get specific user by username
    getUser(username) {
        return new Promise((resolve, reject) => {
            axios.get(`${this.url}/getit/user?username=${username}`, this.config)
            .then(x => resolve(x.data))
            .catch(e => {
                alert("User does not exist!.");
                reject();
            });
        });
    }
}
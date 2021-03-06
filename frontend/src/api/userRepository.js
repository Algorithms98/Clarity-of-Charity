import axios from "axios";

export class UserRepository {
    //url = 'http://localhost:8000';
    url = 'http://3.143.234.231:8000'; // switch to cloud once pulled
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


    getUsername(id){
        return new Promise((resolve, reject) => {
            axios.get(`${this.url}/getit/username/${id}`, this.config)
            .then(x => resolve(x.data))
            .catch(e => {
                alert("User does not exist!.");
                reject();
            });
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

    // login
    login(username, password) {
        return new Promise((resolve, reject) => {
            axios.post(`${this.url}/postit/login`,
                {
                    "username": username,
                    "password": password,
                }
                , this.config)
                .then(x => {
                    console.log('logged in');
                    resolve(x.data);
                })
                .catch(e => {
                    console.log(e.response.data)
                    alert(e.response.data);
                reject();
            });
        });
    }
    
    
    register(username, password, user_type,title,location, logo, description) {
        return new Promise((resolve, reject) => {
            axios.post(`${this.url}/postit/register`,
                {
                    "username": username,
                    "password": password,
                    "user_type": user_type,
                    "title": title,
                    "location": location,
                    "logoURL": logo,
                    "description":description,
                }
                , this.config)
            .then(x => resolve(x.data))
                .catch(e => {
                console.log(e.response.data)
                alert(e.response.data);
                reject();
            });
        });
    }

    changePW(userID,pw){
        return new Promise((resolve, reject)=>{
            axios.put(
                `${this.url}/putit/userpwd?userid=${userID}&newpwd=${pw}`,
            )
            .catch(error=>alert(error));
        });

    }

    banUser(userID){
        return new Promise((resolve, reject)=>{
            axios.delete(
                `${this.url}/deleteit/${userID}`,
            )
            .catch(error=>alert(error));
        });
    }

    getNPOID(userID){
        return new Promise((resolve, reject) => {
            axios.get(`${this.url}/getit/npoIDByUserID/?userID=${userID}`, this.config)
            .then(x => resolve(x.data))
            .catch(e => {
                alert("User linked to NPO does not exist!.");
                reject();
            });
        });
    }
}

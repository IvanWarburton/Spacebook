import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            photo: null,
            listData: [],
            loggedInUser: null,
            sessionToken: null,
            //Broken Bit v
            viewingUsersId: this.props.route.params.UserId,
            loggedInUserViewing: false
        }
    }

    async componentDidMount() {
        this.setState({
            sessionToken: await AsyncStorage.getItem('@session_token'),
            loggedInUser: await AsyncStorage.getItem('@user_id')
        });
        this.getData();
    }

    getProfilePicture = async () => {
        let UserId = null;

        if (this.state.viewingUsersId != null) { UserId = this.state.viewingUsersId; }
        else { UserId = this.state.loggedInUser; }

        fetch("http://localhost:3333/api/1.0.0/user/" + UserId + "/photo",
            { headers: { 'X-Authorization': this.state.sessionToken } })
            .then((res) => { return res.blob(); })
            .then((resBlob) => {
                let data = URL.createObjectURL(resBlob);
                this.setState({
                    photo: data,
                    isLoading: false
                })
            })
            .catch((err) => {
                console.log("error", err)
            });
    }


    getData = async () => {
        let UserId = null;

        if (this.state.viewingUsersId != null) {
            UserId = this.state.viewingUsersId;
            this.setState({ loggedInUserViewing: false })
        }
        else {
            UserId = this.state.loggedInUser;
            this.setState({ loggedInUserViewing: true })
        }

        return fetch("http://localhost:3333/api/1.0.0/user/" + UserId, {
            'headers': { 'X-Authorization': this.state.sessionToken }
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json()
                } else if (response.status === 401) {
                    console.log("Unauthorised");
                } else {
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
                this.getProfilePicture();
                this.setState({ listData: responseJson })
            })
            .catch((error) => {
                console.log(error);
            })
    }


    signOut = async () => {
        let token = await AsyncStorage.getItem('@session_token');
        await AsyncStorage.removeItem('@session_token');
        await AsyncStorage.removeItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: 'post',
            headers: {
                "X-Authorization": token
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log("Logged Out");
                    window.location.reload(false);
                } else if (response.status === 401) {
                    console.log("Logged Out");
                    window.location.reload(false);
                } else {
                    throw 'Something went wrong';
                }
            })
            .catch((error) => {
                console.log(error);
                ToastAndroid.show(error, ToastAndroid.SHORT);
            })
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text>Loading..</Text>
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>

                    <Image
                        style={styles.logo}
                        source={{ uri: this.state.photo }}
                    />

                    <Text style={styles.mainTitle}>
                        {this.state.listData.first_name} {this.state.listData.last_name}
                    </Text>


                    <Text style={styles.mainText}>
                        Email: {this.state.listData.email}
                    </Text>

                    <Button
                        style={styles.button}
                        title={"Friends: " + this.state.listData.friend_count}
                        onPress={() => this.props.navigation.navigate("Friends")}
                    />

                    {this.state.loggedInUserViewing && (
                        <Button
                            style={styles.button}
                            title="Edit Profile"
                            onPress={() => this.props.navigation.navigate("Edit Profile")}
                        />)
                    }

                    <Text style={styles.mainText}>
                        Posts: .....
                    </Text>

                    {this.state.loggedInUserViewing && (
                        <Button
                            style={styles.button}
                            title="Sign Out"
                            onPress={() => this.signOut()}
                        />
                    )}
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    container2:
    {
        flexDirection: "row",
        justifyContent: 'space-evenly'
    },
    mainTitle:
    {
        fontSize: 40,
        fontWeight: 'bold'
    },
    mainText:
    {
        fontSize: 20,
        fontWeight: 'bold'
    },
    button:
    {
        padding: 10
    },
    logo:
    {
        width: 200,
        height: 200
    }
});

export default Profile;
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Modal } from 'react-native';
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
            viewingUsersId: null,
            loggedInUserViewing: false,
            isModalVisible: false,
            friendsFriendList: [],
            modalIsLoading: false
        }

    }

    async componentDidMount() {
        this.setState({
            sessionToken: await AsyncStorage.getItem('@session_token'),
            loggedInUser: await AsyncStorage.getItem('@user_id'),
            viewingUsersId: await AsyncStorage.getItem('@viewing_user_id')
        });
        await AsyncStorage.removeItem('@viewing_user_id');
        if (this.state.viewingUsersId == this.state.loggedInUser) {
            this.setState({ viewingUsersId: null });
        }
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
                if(this.state.viewingUsersId != null){this.getFriendsFriends();}
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

    setModalVisible() {
        if (this.state.isModalVisible == false) { this.setState({ isModalVisible: true }); }
        else { this.setState({ isModalVisible: false }); }
    }

    getFriendsFriends()
    {
        return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.viewingUsersId + "/friends", {
            'headers': {
                'X-Authorization': this.state.sessionToken
            }
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
                this.setState({
                    modalIsLoading: false,
                    friendsFriendList: responseJson
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    friendsResultList = () => {

        let Friends = [];

        if (this.state.modalIsLoading) {
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

            for (let i = 0; i < this.state.friendsFriendList.length; i++) {
                Friends.push(
                    <View>
                        <Text>
                            {this.state.friendsFriendList[i].user_givenname + " " + this.state.friendsFriendList[i].user_familyname}
                        </Text>
                        <Text>
                            {" " + this.state.friendsFriendList[i].user_email}
                        </Text>
                    </View>
                );

            }

            return Friends;
        }

    }

    render() {
        const { isModalVisible } = this.state;
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

                    {!this.state.loggedInUserViewing && (
                        <Button
                            style={styles.buttonBack}
                            title={"Back to Your Profile"}
                            onPress={() => window.location.reload(false)}
                        />)
                    }

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

                    {this.state.loggedInUserViewing && (
                        <Button
                            style={styles.button}
                            title={"Friends: " + this.state.listData.friend_count}
                            onPress={() => this.props.navigation.navigate("Friends")}
                        />
                    )}


                    {!this.state.loggedInUserViewing && (
                    <View>
                    <Button title={"Friends: " + this.state.listData.friend_count} onPress={() => this.setModalVisible()} />

                    <Modal visible={isModalVisible}
                        animationType="fade"
                        transparent={true}>

                        <View style={styles.modalView}>

                            <this.friendsResultList />

                            <Button title="Close" onPress={() => this.setModalVisible()} />
                        </View>

                    </Modal>
                    </View>
                    )}

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
        justifyContent: 'flex-start'
    },
    buttonBack:
    {
        padding: 10
    },
    logo:
    {
        width: 200,
        height: 200
    },
    centeredView:
    {

    },
    modalView:
    {
        flex: 1,
        margin: 20,
        marginVertical: "50%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    }
});

export default Profile;
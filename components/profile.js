import React, { Component} from 'react';
import { View, Text, StyleSheet, Button, Image, Modal, ScrollView,TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            listData: [],
            friendsFriendList: [],
            posts: [],
            isLoading: true,
            isLoadingPosts: true,
            photo: null,
            loggedInUser: null,
            sessionToken: null,
            viewingUsersId: null,
            loggedInUserViewing: false,
            isModalVisible: false,
            modalIsLoading: false,
            noPostsFound: true,
            post: {text: ""}
            
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
                    photo: data
                })
                if(this.state.viewingUsersId != null){this.getFriendsFriends();}
                this.getPosts();
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

    async getFriendsFriends()
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
                            {this.state.friendsFriendList[i].user_email}
                        </Text>
                    </View>
                );

            }

            return Friends;
        }

    }

    getPosts = async () =>
    {
        let user = null;

        if(this.state.viewingUsersId == null){user = this.state.loggedInUser;}
        else{user = this.state.viewingUsersId;}

        return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post", {
            'headers': {
                'X-Authorization': this.state.sessionToken
            }
        })
        .then((response) => {
            if (response.status === 200) {
                return response.json()
            } else if (response.status === 401) {
                console.log("Unauthorised");
            }else if (response.status === 403) {
                console.log("Not friends with user");
            }else if (response.status === 404) {
                console.log("Not found");
            }else if (response.status === 500) {
                console.log("Server Error");
            } else {
                throw 'Something went wrong';
            }
        })
        .then((responseJson) => {
            if(responseJson.length == 0)
            {
                this.setState({
                    isLoading: false,
                    isLoadingPosts: false,
                    noPostsFound: true,
                })
            }
            else{
                this.setState({
                    isLoading: false,
                    isLoadingPosts: false,
                    noPostsFound: false,
                    posts: responseJson
                })
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    postLists = () =>
    {
        let Posts = [];

        if (this.state.isLoadingPosts) {
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
        else if(this.state.noPostsFound)
        {
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text>There are no posts at this time.</Text>

                    <View style={styles.container2}>
                        <TextInput
                        style={styles.input}
                        placeholder="Add Post"
                        onChangeText={(text) => this.state.post.text = text}
                        />
                        
                        <Button
                            title="Add Post"
                            onPress={() => this.createPost()}
                        /> 
                    </View>

                </View>
            );
        }
        else {
            Posts.push(
            <View style={styles.container2}>
                <TextInput
                style={styles.input}
                placeholder="Add Post"
                onChangeText={(text) => this.state.post.text = text}
                />
                
                <Button
                    title="Add Post"
                    onPress={() => this.createPost()}
                /> 
            </View>);
            
            for (let i = 0; i < this.state.posts.length; i++) {
                Posts.push(
                    <View>
                        <Text>
                            {this.state.posts[i].author.first_name} {this.state.posts[i].last_name}:
                        </Text>
                        <Text>
                            {this.state.posts[i].text}
                        </Text>
                        <Text>
                            Likes: {this.state.posts[i].numLikes} Time Posted: {this.state.posts[i].timestamp}
                        </Text>

                    </View>
                );

            }

            return Posts;
        }
    }

    async createPost()
    {
        let user = null;
        this.setState({isLoadingPosts: true});

        if(this.state.viewingUsersId == null){user = this.state.loggedInUser;}
        else{user = this.state.viewingUsersId;}

        return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post", {
            method: 'post',
            headers: 
            {
                'Content-Type': 'application/json',
                'X-Authorization': this.state.sessionToken
            },
            body: JSON.stringify(this.state.post)
        })
        .then((response) => {
            if (response.status === 201) {
                console.log("Created");
                this.getPosts();
            } else if (response.status === 401) {
                console.log("Unauthorised");
            } else if (response.status === 404) {
                console.log("Not found");
            } else if (response.status === 500) {
                console.log("Server Error");
            } else {
                throw 'Something went wrong';
            }
        })
        .catch((error) => {
            console.log(error);
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
                        <View style={styles.container2}>
                        <Button
                            
                            title="Edit Profile"
                            onPress={() => this.props.navigation.navigate("Edit Profile")}
                        />
                        <Button
                            
                            title={"Friends: " + this.state.listData.friend_count}
                            onPress={() => this.props.navigation.navigate("Friends")}
                        />
                        <Button
                            
                            title="Sign Out"
                            onPress={() => this.signOut()}
                        />
                        </View>
                    )}

                    {!this.state.loggedInUserViewing && (
                    <View>
                    <Button title={"Friends: " + this.state.listData.friend_count} onPress={() => this.setModalVisible()} />

                    <Modal visible={this.state.isModalVisible}
                        animationType="fade"
                        transparent={true}>

                        <View style={styles.modalView}>

                            <this.friendsResultList />

                            <Button title="Close" onPress={() => this.setModalVisible()} />
                        </View>

                    </Modal>
                    </View>
                    )}

                    <ScrollView style={styles.thing}>
                    <this.postLists />
                    </ScrollView>
 
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
        flex: 1,
        flexDirection: "row",
        justifyContent: 'space-evenly'
    },
    thing:
    {
        padding: 10
    },
    mainTitle:
    {
        flex: 1,
        fontSize: 40,
        fontWeight: 'bold',
        padding: 10
    },
    mainText:
    {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10
    },
    button:
    {
        flex: 1,
        justifyContent: 'flex-start'
    },
    buttonBack:
    {
        padding: 10
    },
    logo:
    {
        margin: 20,
        width: 200,
        height: 200
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
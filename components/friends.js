import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Friends extends Component {
    
    constructor(props){
        super(props);

        this.state = {
            isLoadingData: true,
            friendList:[],
            searchedFriends:[],
            search: ""
        }
    }

    async componentDidMount() {
        this.getFriends();
      }

    getFriends = async () => {
        const SessionToken = await AsyncStorage.getItem('@session_token');
        const UserId = await AsyncStorage.getItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/user/" + UserId + "/friends", {
              'headers': {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return response.json()
                }else if(response.status === 401){
                    console.log("Unauthorised");
                }else{
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
              this.setState({
                isLoadingData: false,
                friendList: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
      }

    searchForFriends = async () =>
    {
        this.setState({isLoadingData: true});

        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.search + "&limit=20", {
              'headers': {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return response.json()
                }else if(response.status === 401){
                    console.log("Unauthorised");
                }else{
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
              this.setState({
                isLoadingData: false,
                searchedFriends: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    searchResults = () =>
    {
        let UserId = AsyncStorage.getItem('@user_id');

        for(let i = 0; i<this.state.searchedFriends.length; i++)
        { 
            console.log(UserId);
            console.log(this.state.searchedFriends[i].user_id);
            if(this.state.searchedFriends[i].user_id == UserId)
            {
                this.state.searchedFriends.splice(i,1)
            } 
        }

        for(let i = 0; i<this.state.searchedFriends.length; i++)
        { 
            for(let j = 0; j<this.state.friendList.length; j++)
            {
                if (this.state.searchedFriends[i].user_id == this.state.friendList[j].user_id)
                {
                    this.state.searchedFriends.splice(i,1)
                }
            }
        }

        let searchResults = [];

        for(let i = 0; i<this.state.searchedFriends.length; i++)
        {  
            searchResults.push(
            <View style={styles.container2}>
                <Text>
                    {this.state.searchedFriends[i].user_givenname + " " + this.state.searchedFriends[i].user_familyname}
                </Text>
                <Text>
                    {" " + this.state.searchedFriends[i].user_email}
                </Text>
                <Button
                    style={styles.button}
                    title="Add Friend"
                    padding="10"
                    onPress={() => this.addFriend(this.state.searchedFriends[i].user_id)}
                />
            </View>
            );
              
        }

        return searchResults;
 
    }

    friendsResultList = () =>
    {
        let Friends = [];

        for(let i = 0; i<this.state.friendList.length; i++)
        {  
            Friends.push(
            <TouchableOpacity style={styles.container2} /*onpress view friends profile */>
                <Text>
                    {this.state.friendList[i].user_givenname + " " + this.state.friendList[i].user_familyname}
                </Text>
                <Text>
                    {" " + this.state.friendList[i].user_email}
                </Text>
            </TouchableOpacity>
            );
              
        }

        return Friends;
 
    }

    async addFriend(firendID)
    {
        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/user/" + firendID + "/friends", {
            method: 'post',
            headers: {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return "Friend Added"
                }else if(response.status === 201){
                    return "Friend Added"
                }else if(response.status === 401){
                    console.log("Unauthorised");
                }else if(response.status === 403){
                    console.log("User is already added as a friend");
                }else if(response.status === 404){
                    console.log("not Found");
                }else{
                    throw 'Something went wrong';
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    
    
    render() {
        if (this.state.isLoadingData)
        {
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
        else if(this.state.friendList.length > 0)
        {
            return (
                <View style={styles.container}>
    
                    <View style={styles.container2}>
                        
                        <Text style={styles.mainTitle}>
                            SpaceBook Friends
                        </Text>
                    </View>
                    
                    <ScrollView>
                        {this.friendsResultList(this)}
                    </ScrollView>

                    <TextInput
                        style={styles.input}
                        placeholder="Search for friends"
                        onChangeText={(search) => this.setState({search})}
                        value={this.state.search}
                    />
                        
                    <Button
                        style={styles.button}
                        title="Search"
                        padding="10"
                        onPress={() => this.searchForFriends()}
                    />

                    <ScrollView>
                        <this.searchResults/>
                    </ScrollView>

                </View>
            );
        }
        else
        {
        return (
            <View style={styles.container}>

                <View style={styles.container2}>
                    
                    <Text style={styles.mainTitle}>
                        SpaceBook Friends
                    </Text>
                </View>
                
                <Text style={styles.mainText}>
                    It doesnt look like you have any friends at this time.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Search for friends"
                    onChangeText={(search) => this.setState({search})}
                    value={this.state.search}
                />
                        
                <Button
                    style={styles.button}
                    title="Search"
                    padding="10"
                    onPress={() => this.searchForFriends()}
                />

                    <ScrollView>
                        <this.searchResults/>
                    </ScrollView>
                

            </View>
        );
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
        justifyContent: 'space-evenly',
        margin: 20
    },
    mainTitle:
    {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    mainText:
    {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 40
    },
    button:
    {
        padding: 10
    },
    input:
    {
        margin: 40,
        padding: 10,
        width: '70%'
    }
});

export default Friends;
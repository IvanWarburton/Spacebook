import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Friends extends Component {
    
    constructor(props){
        super(props);

        this.state = {
            isLoadingData: true,
            friendList:[],
            searchedFriends: [],
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
        let searchResults = [];

        for(let i = 0; i<this.state.searchedFriends.length; i++)
        {  
            searchResults.push(<View style={styles.container2}>
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

    async addFriend(firendID)
    {
        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/user" + firendID + "/friends", {
            method: 'post',
            headers: {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
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

    friendCheck = () => {

        if(this.state.friendList.length > 0)
        {
            return(
            <TouchableOpacity>
                <Text style={styles.mainText}>
                    David
                </Text>
            </TouchableOpacity>
            );
        }
        else
        {
            
            return(
            <View style={styles.container}>
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
                
            </View>
            );
        }
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
        else if(this.state.searchedFriends.length > 0)
        {
            return (
                <View style={styles.container}>
    
                    <View style={styles.container2}>
                        
                        <Text style={styles.mainTitle}>
                            SpaceBook Friends
                        </Text>
                    </View>
                    
                    <this.friendCheck/>

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
                
                
                <this.friendCheck/>

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
    subContainer:
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
        fontWeight: 'bold',
        textAlign: 'center'
    },
    mainText:
    {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
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
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FriendRequests extends Component {

    constructor(props){
        super(props);

        this.state = {
            isLoadingData: true,
            requestList:[]
        }
    }

    async componentDidMount() {
        this.searchForRequests();
      }

    searchForRequests = async () =>
    {
        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
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
                requestList: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async acceptFriend(firendID)
    {
        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
            method: 'post',
            headers: {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return "Request Accepted"
                }else if(response.status === 201){
                    return "Request Accepted"
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

    async rejectFriend(firendID)
    {
        const SessionToken = await AsyncStorage.getItem('@session_token');

        return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
            method: 'DELETE',
            headers: {
                'X-Authorization':  SessionToken
              }
            })
            .then((response) => {
                if(response.status === 200){
                    return "Request Accepted"
                }else if(response.status === 201){
                    return "Request Accepted"
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

    displayResults = () =>
    {
        let searchResults = [];

        for(let i = 0; i<this.state.requestList.length; i++)
        {  
            searchResults.push(
            <View style={styles.container2}>
                <Text>
                    {this.state.requestList[i].first_name + " " + this.state.requestList[i].last_name}
                </Text>
                <Text>
                    {" " + this.state.requestList[i].email}
                </Text>
                <Button
                    style={styles.button}
                    title="Accept Request"
                    padding="10"
                    onPress={() => this.acceptFriend(this.state.requestList[i].user_id)}
                />
                <Button
                    style={styles.button}
                    title="Reject Request"
                    padding="10"
                    onPress={() => this.rejectFriend(this.state.requestList[i].user_id)}
                />
            </View>
            );
              
        }

        return searchResults;
 
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
        else if(this.state.requestList.length > 0)
        {
            return (
                <View style={styles.container}>
    
                    <View style={styles.container2}>
                        
                        <Text style={styles.mainTitle}>
                            SpaceBook Friend Requests
                        </Text>
                    </View>

                    <ScrollView>
                        <this.displayResults/>
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
                        SpaceBook Friends  Requests
                    </Text>
                </View>
                
                
                <Text style={styles.mainText}>
                    It doesnt look like you have any friends requests at this time.
                </Text>

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

export default FriendRequests;
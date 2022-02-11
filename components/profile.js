import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component {

    constructor(props){
        super(props);
    
        this.state = {
          isLoading: true,
          isEditing: false,
          listData: []
        }
    }

    componentDidMount() {
        this.getData();
      }
    
    
      getData = async () => {
        const SessionToken = await AsyncStorage.getItem('@session_token');
        const UserId = await AsyncStorage.getItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/user/" + UserId, {
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
                isLoading: false,
                listData: responseJson
              })
            })
            .catch((error) => {
                console.log(error);
            })
      }
    

    signOut = async () =>
    {
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
            if(response.status === 200){
                console.log("Logged Out");
                window.location.reload(false);
            }else if(response.status === 401){
                console.log("Logged Out");
                window.location.reload(false);
            }else{
                throw 'Something went wrong';
            }
        })
        .catch((error) => {
            console.log(error);
            ToastAndroid.show(error, ToastAndroid.SHORT);
        })
    }

    editInfo = async () =>
    {
        
        let userID = await AsyncStorage.getItem('@user_id');
        let token = await AsyncStorage.getItem('@session_token');
        return fetch("http://localhost:3333/api/1.0.0/user/" + userID, 
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "X-Authorization": token
            },
            body: JSON.stringify(this.state.listData)
        }
        )

        .then((response) =>
        {
            if(response.status === 200){
                window.location.reload(false);
            }else if(response.status === 400){
                throw 'Invalid email or password';
            }else{
                throw 'Something went wrong';
            }
        })

        .catch((error) => 
        {
            console.log(error);
        })
    }



    render() {
        if (this.state.isLoading)
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
        else if(this.state.isEditing)
        {
            return (
                <View style={styles.container}>

                    <Text style={styles.mainTitle}>
                        Edit My Information
                    </Text>

                    <Text style={styles.mainText}>
                        First Name:
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder={this.state.listData.first_name}
                        onChangeText={(first_name) => this.state.listData["first_name"] = first_name}
                    />

                    <Text style={styles.mainText}>
                        Last Name: 
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder={this.state.listData.last_name}
                        onChangeText={(last_name) => this.state.listData["last_name"] = last_name}
                    />


                    <Text style={styles.mainText}>
                        Email:
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder={this.state.listData.email}
                        onChangeText={(email) => this.state.listData["email"] = email}
                    />

                    <Text style={styles.mainText}>
                        Password:
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder= "Enter A New Password"
                        onChangeText={(password) => this.state.listData["password"] = password}
                    />

                    <View style={styles.container2}>
                        <Button
                            style={styles.button}
                            title="Update"
                            onPress={() => this.editInfo()}
                        />
                        <Button
                            style={styles.button}
                            title="Cancel"
                            onPress={() => this.setState({isEditing: false})}
                        />
                    </View>
                </View>
            );
        }
        else
        {
            return (
                <View style={styles.container}>


                    <Text style={styles.mainTitle}>
                        Picture
                    </Text>

                    <Text style={styles.mainTitle}>
                        {this.state.listData.first_name} {this.state.listData.last_name}
                    </Text>


                    <Text style={styles.mainText}>
                        Email: {this.state.listData.email}
                    </Text>
                    
                    <Button
                        style={styles.button}
                        title={"Friends: "+ this.state.listData.friend_count}
                        onPress={() => this.props.navigation.navigate("Friends")}
                    />

                    <Button
                        style={styles.button}
                        title="Edit Profile"
                        onPress={() => this.setState({isEditing: true})}
                    />

                    <Text style={styles.mainText}>
                        Posts: .....
                    </Text>

                    <Button
                        style={styles.button}
                        title="Sign Out"
                        onPress={() => this.signOut()}
                    />
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
        justifyContent: 'space-evenly'
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
    input:
    {
        margin: 40,
        padding: 10
    }
});

export default Profile;
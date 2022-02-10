import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component {

    constructor(props){
        super(props);
    
        this.state = {
          isLoading: true,
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
            }else if(response.status === 401){
                console.log("Logged Out");
            }else{
                throw 'Something went wrong';
            }
        })
        .catch((error) => {
            console.log(error);
            ToastAndroid.show(error, ToastAndroid.SHORT);
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
    }
});

export default Profile;
import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Profile extends Component {

    signOut = async () =>
    {
        let token = await AsyncStorage.getItem('@session_token');
        await AsyncStorage.removeItem('@session_token');
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
        return (
            <View style={styles.container}>

                <View style={styles.container2}>
                    
                    <Text style={styles.mainTitle}>
                        SpaceBook Profile
                    </Text>
                </View>

                    <Text style={styles.mainText}>
                        Profile Page
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
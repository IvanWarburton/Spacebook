import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SignIn extends Component {

    constructor(props){
        super(props);

        this.state = 
        {
            email: "",
            password: ""
        }
    }

    login = async () => 
    {
        return fetch("http://localhost:3333/api/1.0.0/login", 
        {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(this.state)
        }
        )

        .then((response) =>
        {
            if(response.status === 200){
                return response.json()
            }else if(response.status === 400){
                throw 'Invalid email or password';
            }else{
                throw 'Something went wrong';
            }
        })

        .then(async (responseJson) => 
        {
            console.log(responseJson);
            await AsyncStorage.setItem('@session_token', responseJson.token);
            await AsyncStorage.setItem('@user_id', responseJson.id);
            console.log("Logged In")
        })

        .catch((error) => 
        {
            console.log(error);
        })
    }


    render() {
        return (
            <View style={styles.container}>

                <View style={styles.container2}>

                    {/*
                    <Image 
                    style={styles.logo}
                    source={require('./assets/Spacebook_Icon.png')} 
                    />
                    */}
                    
                    <Text style={styles.mainTitle}>
                        SpaceBook
                    </Text>
                    </View>

                    <Text style={styles.mainText}>
                        Sign up or Sign in to your Spacebook acount.
                    </Text>

                    <TextInput
                            style={styles.input}
                            placeholder="Email"
                            onChangeText={(email) => this.setState({email})}
                            value={this.state.email}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            secureTextEntry
                        />

                        <Button
                            style={styles.button}
                            title="Sign In"
                            onPress={() => this.login()}
                        />
                        
                        <Button
                            style={styles.button}
                            title="Sign Up"
                            onPress={() => this.props.navigation.navigate("Sign Up")}
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
    },
    button:
    {
        padding: 10
    },
    input:
    {
        margin: 40,
        padding: 10
    },
    space:
    {
        width: 20,
        height: 20
    },
    logo:
    {
        width: 100,
        height: 100,
        resizeMode: 'contain'
    }
});

export default SignIn;
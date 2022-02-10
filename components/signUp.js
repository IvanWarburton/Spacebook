import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Image, Alert } from 'react-native';

class SignUp extends Component {

    constructor(props){
        super(props);

        this.state = {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            alert_message: ""
        }
    }

    signup = async () => {

        // const IncorrectDetailsAlert = () =>
        // Alert.alert(
        //     "Incorrect Login Details Entered",
        //     this.state.alert_message,
        //     [{ text: "OK"}]
        // );

        if(this.state.first_name.length > 20 || this.state.first_name.length < 1)
        {
            //this.setState({alert_message: 'First Name cannot exceed a maximum of 20 characters'});
            //IncorrectDetailsAlert;
            console.log('First Name must be between 0 and 20 characters');
        }
        else if(this.state.last_name.length > 20 || this.state.last_name.length < 1)
        {
            console.log('Last Name must be between 0 and 20 characters');
        }
        else if(!this.state.email.includes("@") || this.state.email.length < 1)
        {
            console.log('Invalid Email: Example Email Spacebook@Spacebook.com');
        }
        else if(this.state.password.length < 6)
        {
            console.log('Invalid Password: Must be more than 6 charaters');
        }
        else
        {
            return fetch("http://localhost:3333/api/1.0.0/user", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state)
            })
            .then((response) => {
                if(response.status === 201){
                    return response.json()
                }else if(response.status === 400){
                    throw 'Failed validation';
                }else{
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
                console.log("User created with ID: ", responseJson);
                this.props.navigation.navigate("Sign In");
            })
            .catch((error) => {
                console.log(error);
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>

                <View style={styles.container2}>
                    {/*
                    <Image 
                    style={styles.logo}
                    source={require('./assets/Spacebook_Icon.png')} 
                    />*/}
                    
                    <Text style={styles.mainTitle}>
                        SpaceBook
                    </Text>
                </View>

                    <Text style={styles.mainText}>
                        Sign up to your Spacebook acount today.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your first name..."
                        onChangeText={(first_name) => this.setState({first_name})}
                        value={this.state.first_name}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your last name..."
                        onChangeText={(last_name) => this.setState({last_name})}
                        value={this.state.last_name}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email..."
                        onChangeText={(email) => this.setState({email})}
                        value={this.state.email}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password..."
                        onChangeText={(password) => this.setState({password})}
                        value={this.state.password}
                        secureTextEntry
                    />
                        
                    <Button
                        style={styles.button}
                        title="Sign Up"
                        padding="10"
                        onPress={() => this.signup()}
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

export default SignUp;
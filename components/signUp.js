import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Image } from 'react-native';

class signUp extends Component {
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
                        Sign up or Sign in to your Spacebook acount.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Surname"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                    />
                        
                    <Button
                        style={styles.button}
                        title="Sign Up"
                        padding="10"
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

export default signUp;
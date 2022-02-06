import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';

class welcomePage extends Component {
    render() {
        return (
            <View style={[styles.container, { flexDirection: "column" }]}>

                <View style={{ flex: 1 }}>

                    <Text style={styles.mainTitle}>
                        SpaceBook
                    </Text>

                    <Text style={styles.mainText}>
                        Sign up or Sign in to your Spacebook acount.
                    </Text>

                </View>

                <View style={{ flex: 2 }}>

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                    />

                    <Button
                        style={styles.button}
                        title="Sign In"
                        padding="10"
                        onPress={() => Alert.alert('Signed in')}
                    />
                    <View style={styles.space} />
                    <Button
                        title="Sign Up"
                        padding="10"
                        onPress={() => Alert.alert('Signing Up')}
                    />

                </View>

            </View>


        )
    }
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        padding: 20
    },
    mainTitle:
    {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 40
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
    }
});

export default welcomePage;
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class friendRequests extends Component {
    render() {
        return (
            <View style={styles.container}>

                <View style={styles.container2}>
                    
                    <Text style={styles.mainTitle}>
                        SpaceBook Friend Requests
                    </Text>
                </View>

                    <Text style={styles.mainText}>
                        Your Friend Requests
                    </Text>
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

export default friendRequests;
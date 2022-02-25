import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';

class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoadingData: true,
            isEditingImage: false,
            listData: [],
            hasPermission: null,
            type: Camera.Constants.Type.back
        }
    }

    async componentDidMount() {
        this.getData();
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setState({ hasPermission: status === 'granted' })
    }

    sendToServer = async (data) => {
        const SessionToken = await AsyncStorage.getItem('@session_token');
        const UserId = await AsyncStorage.getItem('@user_id');

        let res = await fetch(data.base64);
        let blob = await res.blob();

        return fetch("http://localhost:3333/api/1.0.0/user/" + UserId + "/photo", {
            method: "POST",
            headers: {
                "Content-Type": "image/png",
                "X-Authorization": SessionToken
            },
            body: blob
        })
            .then((response) => {
                console.log("Picture added", response);
                window.location.reload(false);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    takePicture = async () => {
        if (this.camera) {
            const options = {
                quality: 0.5,
                base64: true,
                onPictureSaved: (data) => this.sendToServer(data)
            };
            await this.camera.takePictureAsync(options);
            
        }
    }


    getData = async () => {
        const SessionToken = await AsyncStorage.getItem('@session_token');
        const UserId = await AsyncStorage.getItem('@user_id');
        return fetch("http://localhost:3333/api/1.0.0/user/" + UserId, {
            'headers': {
                'X-Authorization': SessionToken
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json()
                } else if (response.status === 401) {
                    console.log("Unauthorised");
                } else {
                    throw 'Something went wrong';
                }
            })
            .then((responseJson) => {
                this.setState({
                    isLoadingData: false,
                    listData: responseJson
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }


    editInfo = async () => {

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

            .then((response) => {
                if (response.status === 200) {
                    window.location.reload(false);
                } else if (response.status === 400) {
                    throw 'Bad Request';
                } else if (response.status === 403) {
                    throw 'Forbidden';
                } else if (response.status === 404) {
                    throw 'Not Found';
                } else if (response.status === 500) {
                    throw 'Server Error';
                } else {
                    throw 'Something went wrong';
                }
            })

            .catch((error) => {
                console.log(error);
            })
    }



    render() {
        if (this.state.isLoadingData) {
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
        else if (this.state.isEditingImage) {
            if (this.state.hasPermission) {
                return (
                    <View style={styles.camContainer}>

                        <Camera
                            style={styles.camera}
                            type={this.state.type}
                            ref={ref => this.camera = ref}
                        >

                            <View style={styles.camButtonContainer}>
                                <TouchableOpacity
                                    style={styles.camButton}
                                    onPress={() => {
                                        this.takePicture();
                                    }}>
                                    <Text style={styles.camText}> Take Photo </Text>
                                </TouchableOpacity>
                            </View>
                        </Camera>


                        <Button
                            style={styles.button}
                            title="Cancel"
                            onPress={() => this.setState({ isEditingImage: false })}
                        />


                    </View>
                );
            } else {
                return (
                    <View>
                        <Text>No access to camera</Text>

                        <Button
                            style={styles.button}
                            title="Cancel"
                            onPress={() => this.setState({ isEditingImage: false })}
                        />
                    </View>
                );
            }
        }
        else {
            return (
                <View style={styles.container}>

                    <Text style={styles.mainTitle}>
                        Edit My Information
                    </Text>

                    <Button
                        style={styles.button}
                        title="Update Profile Picture"
                        onPress={() => this.setState({ isEditingImage: true })}
                    />

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
                        placeholder="Enter A New Password"
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
                            onPress={() => this.props.navigation.navigate("Profile")}
                        />
                    </View>
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
        fontWeight: 'bold'
    },
    mainText:
    {
        fontSize: 20,
        fontWeight: 'bold'
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
    },
    camContainer:
    {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    camera:
    {
        margin: 40,
        width: "100%",
        height: "100%"
    },
    camButtonContainer:
    {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
    },
    camButton:
    {
        flex: 0.1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    camText:
    {
        fontSize: 18,
        color: 'white',
    },
});

export default Profile;
import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';

class Profile extends Component {

    constructor(props){
        super(props);
    
        this.state = {
          isLoading: true,
          isLoadingPhoto: true,
          isLoadingData: true,
          isEditing: false,
          isEditingImage: false,
          photo: null,
          listData: [],
          hasPermission: null,
          type: Camera.Constants.Type.back
        }
    }

    async componentDidMount() {
        this.getData();
        this.getProfilePicture();
        //const {status} = await Camera.requestCameraPermissionsAsync();
        //this.setState({hasPermission: status === 'granted'})
      }

      sendToServer = async (data) =>
        {
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
            })
            .catch((err) => {
                console.log(err);
            }) 
        }

      takePicture = async () => 
      {
          if(this.camera)
          {
              const options = {
                  quality: 0.5,
                  base64: true,
                  onPictureSaved: (data) => this.SendToServer(data)
              };
              await this.camera.takePictureAsync(options);
          }
      }

      getProfilePicture = async () => 
      {
        const SessionToken = await AsyncStorage.getItem('@session_token');
        const UserId = await AsyncStorage.getItem('@user_id');
          fetch("http://localhost:3333/api/1.0.0/user/" + UserId + "/photo",
          { headers:{'X-Authorization':  SessionToken} } )
          .then((res) => {return res.blob();})
          .then((resBlob) => 
          {
              let data = URL.createObjectURL(resBlob);
              this.setState({
                  photo: data,
                  isLoadingPhoto: false
              })
          })
          .catch((err) => {
              console.log("error", err)
          });
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
                isLoadingData: false,
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
        if (this.state.isLoadingPhoto && this.state.isLoadingData)
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
        else if(this.state.isEditingImage)
        {
            if(this.state.hasPermission){
                return(
                  <View style={styles.camContainer}>
                      
                    <Camera 
                      style={styles.camera} 
                      type={this.state.type}
                      ref={ref => this.camera = ref}
                    />

                    <View style={styles.camButtonContainer}>
                        <TouchableOpacity
                            style={styles.camButton}
                            onPress={() => {
                            this.takePicture();
                            }}>
                            <Text style={styles.camText}> Take Photo </Text>
                        </TouchableOpacity>
                    </View>

                    
                    
                    <Button
                            style={styles.button}
                            title="Cancel"
                            onPress={() => this.setState({isEditingImage: false})}
                        />
                    

                  </View>
                );
              }else{
                return(
                    <View>
                        <Text>No access to camera</Text>

                        <Button
                            style={styles.button}
                            title="Cancel"
                            onPress={() => this.setState({isEditingImage: false})}
                        />
                    </View>
                );
              }
        }
        else
        {
            return (
                <View style={styles.container}>

                    <TouchableOpacity onPress={() => this.setState({isEditingImage: true})}>
                        <Image 
                            style={styles.logo}
                            source={{uri: this.state.photo}} 
                        />
                    </TouchableOpacity>
                    

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
    logo:
    {
        width: 200,
        height: 200
    },
    camContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-evenly',
        alignItems: 'center'
      },
      camera: {
        margin: 40,
        width: "100%",
        height: "100%"
      },
      camButtonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
      },
      camButton: {
        flex: 0.1,
        alignSelf: 'flex-end',
        alignItems: 'center',
      },
      camText: {
        fontSize: 18,
        color: 'white',
      },
});

export default Profile;
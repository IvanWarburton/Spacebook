import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "react-bootstrap/Button";
import Ionicons from "react-native-vector-icons/Ionicons";

class Friends extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoadingData: true,
			friendList: [],
			searchedFriends: [],
			search: "",
			sessionToken: null,
			userId: null
		};
	}

	async componentDidMount() {
		this.setState({
			sessionToken: await AsyncStorage.getItem("@session_token"),
			userId: await AsyncStorage.getItem("@user_id"),
		});
		this.getFriends();
	}
	
	getProfilePictures = async () => {
		for (let i = 0; i < this.state.friendList.length; i++) {
			
			fetch("http://localhost:3333/api/1.0.0/user/" + this.state.friendList[i].user_id + "/photo",
				{ headers: { "X-Authorization": this.state.sessionToken } })
				.then((res) => { return res.blob(); })
				.then((resBlob) => {
					let data = URL.createObjectURL(resBlob);
					this.state.friendList[i].user_pic = data;
				})
				.catch((err) => {
					console.log("error", err);
				});
		}
	};

	getFriends = async () => {
		return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.userId + "/friends", {
			"headers": {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({
					isLoadingData: false,
					friendList: responseJson
				});
				this.getProfilePictures();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	searchForFriends = async () => {
		this.setState({ isLoadingData: true });

		return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.search, {
			"headers": {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({
					isLoadingData: false,
					searchedFriends: responseJson
				});
				this.filterSearchResults();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	filterSearchResults = () => {
		for (let i = 0; i < this.state.searchedFriends.length; i++) {
			if (this.state.searchedFriends[i].user_id == this.state.userId) {
				this.state.searchedFriends.splice(i, 1);
			}
		}

		for (let i = 0; i < this.state.searchedFriends.length; i++) {
			for (let j = 0; j < this.state.friendList.length; j++) {
				if (this.state.searchedFriends[i].user_id == this.state.friendList[j].user_id) {
					this.state.searchedFriends.splice(i, 1);
				}
			}
		}
	};

	async goto(userID)
	{
		await AsyncStorage.setItem("@viewing_user_id", userID);
		window.location.reload(false);
	}

	async addFriend(firendID) {
		return fetch("http://localhost:3333/api/1.0.0/user/" + firendID + "/friends", {
			method: "post",
			headers: {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return "Friend Added";
				} else if (response.status === 201) {
					return "Friend Added";
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else if (response.status === 403) {
					console.log("User is already added as a friend");
				} else if (response.status === 404) {
					console.log("not Found");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}



	render() {
		if (this.state.isLoadingData) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}>
					<Text>Loading..</Text>
				</View>
			);
		}
		else if (this.state.friendList.length > 0) {
			return (
				<View style={styles.container}>

					<View style={styles.container2}>

						<Text style={styles.mainTitle}>
                            SpaceBook Friends
						</Text>
					</View>

					<FlatList
						data = {this.state.friendList}
						renderItem={({item}) => 
							<TouchableOpacity
								style={styles.container2}
								onPress={() => this.goto(item.user_id)}
							>
								<Image
									style={styles.friendPics}
									source={{ uri: item.user_pic }}
								/>
								<Text>
									{item.user_givenname + " " + item.user_familyname}
								</Text>
							</TouchableOpacity>
						}
					/>

					<TextInput
						style={styles.input}
						placeholder="Search for friends"
						onChangeText={(search) => this.setState({ search })}
						value={this.state.search}
					/>

					<Button onClick={() => this.searchForFriends()}>Search</Button>
						
					<FlatList
						data = {this.state.searchedFriends}
						renderItem={({item}) => 
							<View style={styles.container2}>
								<Text>
									{item.user_givenname + " " + item.user_familyname}
								</Text>
								<Ionicons name="person-add" style={styles.icon} onPress={() => this.addFriend(item.user_id)}></Ionicons>
							</View>
						}
					/>

				</View>
			);
		}
		else {
			return (
				<View style={styles.container}>

					<View style={styles.container2}>

						<Text style={styles.mainTitle}>
                            SpaceBook Friends
						</Text>
					</View>

					<Text style={styles.mainText}>
                        It doesnt look like you have any friends at this time.
					</Text>

					<TextInput
						style={styles.input}
						placeholder="Search for friends"
						onChangeText={(search) => this.setState({ search })}
						value={this.state.search}
					/>

					<Button onClick={() => this.searchForFriends()}>Search</Button>
	
					<FlatList
						data = {this.state.searchedFriends}
						renderItem={({item}) => 
							<View>
								<Text>
									{item.user_givenname + " " + item.user_familyname}
								</Text>

								<Ionicons name="person-add" style={styles.icon} onPress={() => this.addFriend(item.user_id)}></Ionicons>
							</View>
						}
					/>
						
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
    	justifyContent: "space-evenly",
    	alignItems: "center"
    },
	container2:
    {
    	flexDirection: "row",
    	justifyContent: "space-evenly",
    	alignItems: "center",
    	margin: 20
    },
	mainTitle:
    {
    	fontSize: 40,
    	fontWeight: "bold",
    	textAlign: "center"
    },
	mainText:
    {
    	fontSize: 20,
    	fontWeight: "bold",
    	textAlign: "center",
    	margin: 40
    },
	button:
    {
    	padding: 10
    },
	input:
    {	
    	margin: 40,
    	padding: 10,
    	width: "70%"
    },
	icon:
	{
		fontSize: "200%"
	},
	friendPics:
	{
		margin: 10, 
		width: 50,
		height: 50,
		borderRadius: 50 / 2
	},
});

export default Friends;
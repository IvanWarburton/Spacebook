import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Modal } from "react-native";
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
			userId: null,
			alertModalVisible: false,
			alertModalMesssage: ""
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
					this.setState({ isLoadingData: false });
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
					throw "Error 401: Unauthorised";
				} else if (response.status === 403) {
					throw "Error 403: Can only view the friends of yourself or your friends";
				} else if (response.status === 404) {
					throw "Error 404: Not Found";
				} else if (response.status === 500) {
					throw "Error 500: Server Error";
				} else {
					throw "Error: Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({ friendList: responseJson });
				if(this.state.friendList.length != 0){this.getProfilePictures();}
				else{this.setState({ isLoadingData: false });}
				
			})
			.catch((error) => {
				this.alertMessage(error);
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
				} else if (response.status === 400) {
					throw "Error 404: Bad Request";
				} else if (response.status === 401) {
					throw "Error 401: Unauthorised";
				} else if (response.status === 500) {
					throw "Error 500: Server Error";
				} else {
					throw "Error: Something went wrong";
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
				this.alertMessage(error);
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

	async goto(userID) {
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
					window.location.reload(false);
				} else if (response.status === 201) {
					window.location.reload(false);
				} else if (response.status === 401) {
					throw "Error 401: Unauthorised";
				} else if (response.status === 403) {
					throw "Error 403: User is already added as a friend";
				} else if (response.status === 404) {
					throw "Error 404: Not Found";
				} else {
					throw "Error: Something went wrong";
				}
			})
			.catch((error) => {
				this.alertMessage(error);
			});
	}

	alertMessage(message) {
		this.setState({
			alertModalVisible: true,
			alertModalMesssage: message
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

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text style={styles.mainText}>ALERT</Text>
								<Text style={styles.mainText}>{this.state.alertModalMesssage}</Text>
								<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
							</View>

						</Modal>
					</View>
				</View>
			);
		}
		else if (this.state.friendList.length > 0) {
			return (
				<View style={styles.container}>

					<Text style={styles.mainTitle}>
						Friends
					</Text>

					<FlatList
						data={this.state.friendList}
						renderItem={({ item }) =>
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
						data={this.state.searchedFriends}
						renderItem={({ item }) =>
							<View style={styles.container2}>
								<Text>
									{item.user_givenname + " " + item.user_familyname}
								</Text>
								<Ionicons name="person-add" style={styles.icon} onPress={() => this.addFriend(item.user_id)}></Ionicons>
							</View>
						}
					/>

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text>ALERT</Text>
								<Text>{this.state.alertModalMesssage}</Text>
								<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
							</View>

						</Modal>
					</View>

				</View>
			);
		}
		else {
			return (
				<View style={styles.container}>

					<Text style={styles.mainTitle}>
						Friends
					</Text>

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
						data={this.state.searchedFriends}
						renderItem={({ item }) =>
							<View  style={styles.container2}>
								<Text>
									{item.user_givenname + " " + item.user_familyname}
								</Text>

								<Ionicons name="person-add" style={styles.icon} onPress={() => this.addFriend(item.user_id)}></Ionicons>
							</View>
						}
					/>

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text style={styles.mainText}>ALERT</Text>
								<Text style={styles.mainText}>{this.state.alertModalMesssage}</Text>
								<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
							</View>

						</Modal>
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
		justifyContent: "space-evenly",
		alignItems: "center"
	},
	container2:
	{
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		margin: 10,
		width: 250
	},
	mainTitle:
	{
		fontSize: 40,
		fontWeight: "bold",
		textAlign: "center",
		margin: 40
	},
	mainText:
	{
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		margin: 20
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
	alertModal:
	{
		flex: 1,
		justifyContent: "space-evenly",
		margin: 20,
		marginVertical: "90%",
		backgroundColor: "#ffd4d8",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		textAlign: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	}
});

export default Friends;
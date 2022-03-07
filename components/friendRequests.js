import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

class FriendRequests extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoadingData: true,
			requestList: []
		};
	}

	async componentDidMount() {
		this.searchForRequests();
	}

	searchForRequests = async () => {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
			"headers": {
				"X-Authorization": SessionToken
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
					requestList: responseJson
				});
				this.getProfilePictures();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	async acceptFriend(firendID) {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
			method: "post",
			headers: {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return "Request Accepted";
				} else if (response.status === 201) {
					return "Request Accepted";
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

	async rejectFriend(firendID) {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
			method: "DELETE",
			headers: {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return "Request Accepted";
				} else if (response.status === 201) {
					return "Request Accepted";
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
		else if (this.state.requestList.length > 0) {
			return (
				<View style={styles.container}>

					<Text style={styles.mainTitle}>
						SpaceBook Friend Requests
					</Text>


					<FlatList
						data={this.state.requestList}
						renderItem={({ item }) =>
							<View style={styles.container2}>

								<Text style={styles.mainText}>
									{item.first_name + " " + item.last_name}
								</Text>

								<Ionicons name="person-add" style={styles.icon} onPress={() => this.acceptFriend(item.user_id)}></Ionicons>

								<Ionicons name="person-remove" style={styles.icon} onPress={() => this.rejectFriend(item.user_id)}></Ionicons>
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
							SpaceBook Friends  Requests
						</Text>
					</View>


					<Text style={styles.mainText}>
						It doesnt look like you have any friends requests at this time.
					</Text>

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
		alignItems: "center",
		width: "100%",
		padding: 10
	},
	container2:
	{
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "100%",
		margin: 10,
	},
	mainTitle:
	{
		fontSize: 40,
		fontWeight: "bold",
		textAlign: "center"
	},
	mainText:
	{
		flex: 1,
		fontSize: 15,
		fontWeight: "bold"
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
	}
});

export default FriendRequests;
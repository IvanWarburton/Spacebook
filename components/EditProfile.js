import React, { Component } from "react";
import { View, Text, StyleSheet, TextInput, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import Button from "react-bootstrap/Button";

class Profile extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoadingData: true,
			isEditingImage: false,
			listData: [],
			hasPermission: null,
			type: Camera.Constants.Type.back,
			alertModalVisible: false,
			alertModalMesssage: "",
		};
	}

	async componentDidMount() {
		this.getData();
		const { status } = await Camera.requestCameraPermissionsAsync();
		this.setState({ hasPermission: status === "granted" });
	}

	sendToServer = async (data) => {
		const SessionToken = await AsyncStorage.getItem("@session_token");
		const UserId = await AsyncStorage.getItem("@user_id");

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
				if (response.status === 200) {
					window.location.reload(false);
				} else if (response.status === 400) {
					this.alertMessage("Error 400: Bad Request");
				} else if (response.status === 401) {
					this.alertMessage("Error 401: Unauthorised");
				} else if (response.status === 404) {
					this.alertMessage("Error 404: Not Found");
				} else if (response.status === 500) {
					this.alertMessage("Error 500: Server Error");
				} else {
					this.alertMessage("Error: Something went wrong");
				}
			})
			.catch((err) => {
				this.alertMessage(err);
			});
	};

	takePicture = async () => {
		if (this.camera) {
			const options = {
				quality: 0.5,
				base64: true,
				onPictureSaved: (data) => this.sendToServer(data)
			};
			await this.camera.takePictureAsync(options);

		}
	};


	getData = async () => {
		const SessionToken = await AsyncStorage.getItem("@session_token");
		const UserId = await AsyncStorage.getItem("@user_id");
		return fetch("http://localhost:3333/api/1.0.0/user/" + UserId, {
			"headers": {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					this.alertMessage("Error 401: Unauthorised");
				} else if (response.status === 404) {
					this.alertMessage("Error 404: Not Found");
				} else if (response.status === 500) {
					this.alertMessage("Error 500: Server Error");
				} else {
					this.alertMessage("Error: Something went wrong");
				}
			})
			.then((responseJson) => {
				this.setState({
					isLoadingData: false,
					listData: responseJson
				});
			})
			.catch((error) => {
				this.alertMessage(error);
			});
	};


	editInfo = async () => {
		let state = this.state.listData;

		if (state.first_name.length > 20 || state.first_name.length < 1) {
			this.alertMessage("First Name must be between 1 and 20 characters");
		}
		else if (state.last_name.length > 20 || state.last_name.length < 1) {
			this.alertMessage("Last Name must be between 1 and 20 characters");
		}
		else if (!state.email.includes("@") || state.email.length < 1) {
			this.alertMessage("Invalid Email: Example Email Spacebook@Spacebook.com");
		}
		else if (state.password && state.password.length < 6) {
			this.alertMessage("Invalid Password: Password must be more than 6 charaters");
		}
		else {
			let userID = await AsyncStorage.getItem("@user_id");
			let token = await AsyncStorage.getItem("@session_token");
			return fetch("http://localhost:3333/api/1.0.0/user/" + userID,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						"X-Authorization": token
					},
					body: JSON.stringify(this.state.listData)
				}
			)

				.then((response) => {
					if (response.status === 200) {
						window.location.reload(false);
					} else if (response.status === 400) {
						this.alertMessage("Error 400: Bad Request");
					} else if (response.status === 401) {
						this.alertMessage("Error 401: Unauthorised");
					} else if (response.status === 403) {
						this.alertMessage("Error 403: Forbidden");
					} else if (response.status === 404) {
						this.alertMessage("Error 404: Not Found");
					} else if (response.status === 500) {
						this.alertMessage("Error 500: Server Error");
					} else {
						this.alertMessage("Error: Something went wrong");
					}
				})

				.catch((error) => {
					this.alertMessage(error);
				});
		}
	};

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
						/>

						<View style={styles.container2}>
							<Button onClick={() => this.takePicture()}>Take Picture</Button>
							<Button onClick={() => this.setState({ isEditingImage: false })}>Cancel</Button>
						</View>

					</View>
				);
			} else {
				return (
					<View style={styles.container}>
						<Text style={styles.mainTitle}>No access to camera</Text>

						<Button onClick={() => this.setState({ isEditingImage: false })}>Cancel</Button>
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
						<Button onClick={() => this.editInfo()}>Update</Button>
						<Button onClick={() => this.setState({ isEditingImage: true })}>Update Profile Picture</Button>
						<Button onClick={() => this.props.navigation.navigate("Profile")}>Cancel</Button>
					</View>

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text style={styles.mainText}>ALERT</Text>
								<Text style={styles.alertText}>{this.state.alertModalMesssage}</Text>
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
		width: "100%",
		margin: 10,
	},
	mainTitle:
	{
		fontSize: 40,
		fontWeight: "bold"
	},
	mainText:
	{
		fontSize: 20,
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
		fontWeight: "bold",
		width: "80%",
		borderRadius: 20,
		textAlign: "center",
		backgroundColor: "#D1D1D1"
	},
	camContainer:
	{
		margin: 10,
		flex: 1,
		justifyContent: "space-evenly",
		alignItems: "center"
	},
	camera:
	{
		margin: 10,
		width: "100%",
		height: "100%"
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
	},
	alertText:
	{
		fontSize: 15,
		fontWeight: "bold"
	},
});

export default Profile;
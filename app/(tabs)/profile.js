import { useState, useEffect } from 'react';
import axios from 'axios';
import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import config from '@/Config/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from "@expo/vector-icons";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Avatar code 
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        /*const response = await axios.post(
          `${config.BACKEND_URL}/air-bnb/auth/login`,
          { email: 'bazil@gmail.com', password: '112233' }
        );*/

        const token = await AsyncStorage.getItem('token');
        console.log(token)
        const response = await axios.get(`${config.BACKEND_URL}/air-bnb/profile/user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("sdssd")

        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching profile data');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city" || name === "country") {
      setUpdatedData({
        ...updatedData,
        location: {
          ...userInfo.location,
          ...updatedData.location,
          [name]: value,
        },
      });
    }
    else {
      setUpdatedData({
        ...updatedData,
        [name]: value,
      });
    }
  };

  const handleArrayDelete = (attribute, value) => {
    setUpdatedData({
      ...updatedData,
      [attribute]: (updatedData[attribute] || userInfo[attribute] || []).filter((item) => item !== value),
    });
  };

  const openAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  const selectAvatar = (index) => {
    setSelectedAvatar(index);
    /*setUpdatedData({
        ...updatedData,
        profilePicture: index,
    });*/
    closeAvatarModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await AsyncStorage.getItem('token');
      const updatedProfile = { ...updatedData, profilePicture: selectedAvatar || userInfo.profilePicture }; // Include avatar in profile update
      const response = await axios.put(`${config.BACKEND_URL}/air-bnb/profile/update-info`, updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating profile data');
    }
  };


  if (loading) {
    return <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text>Loading...</Text>
    </View>;
  }

  if (error) {
    return <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text>{error}...</Text>
    </View>;
  }

  const addNewField = (attribute) => {
    setUpdatedData({
      ...updatedData,
      [attribute]: [...(updatedData[attribute] || userInfo[attribute] || []), ''],
    });
  };

  const updateFieldValue = (attribute, index, value) => {
    const updatedArray = [...(updatedData[attribute] || userInfo[attribute] || [])];
    updatedArray[index] = value;
    setUpdatedData({
      ...updatedData,
      [attribute]: updatedArray,
    });
  };
  const calculateTimeAgo = () => {
    const reviewDate = new Date(userInfo.createdAt);
    const now = new Date();
    const timeDiff = now - reviewDate;

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years >= 1) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months >= 1) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <View className='px-[15px] bg-gray-100 pt-[35px]'>
      {isEditing ?
        <ScrollView showsVerticalScrollIndicator={false} className='bg-[#f8f8f8]'>
          {/* Left Section */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Image
                  source={{
                    uri: `/Avatars/${selectedAvatar || userInfo.profilePicture}.jpg`,
                  }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                />
                <TouchableOpacity
                  onPress={openAvatarModal}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#1e3a8a",
                    paddingVertical: 4,
                    paddingHorizontal: 16,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>Change Avatar</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>
                  {userInfo.username}
                </Text>
                <Text
                  style={{
                    backgroundColor: "#6b7280",
                    color: "#f3f4f6",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 16,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {userInfo.role}
                </Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  {(() => {
                    const reviewDate = new Date(userInfo.createdAt);
                    const now = new Date();
                    const timeDiff = now - reviewDate;

                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const months = Math.floor(days / 30);
                    const years = Math.floor(days / 365);

                    if (years >= 1) {
                      return `${years} year${years > 1 ? "s" : ""} ago`;
                    } else if (months >= 1) {
                      return `${months} month${months > 1 ? "s" : ""} ago`;
                    } else {
                      return `${days} day${days > 1 ? "s" : ""} ago`;
                    }
                  })()}
                </Text>
                <Text style={{ color: "#e11d48", fontWeight: "700" }}>
                  On Airbnb
                </Text>
              </View>
            </View>

            <View
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
                {userInfo.username}'s confirmed information status
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <FontAwesome5
                  name="check-circle"
                  size={16}
                  color={userInfo.phoneNumber ? "green" : "#6b7280"}
                />
                <Text style={{ marginLeft: 8, fontSize: 14, color: "#6b7280" }}>
                  Phone number:{" "}
                  <Text style={{ fontWeight: "500" }}>
                    {userInfo.phoneNumber || "Not provided"}
                  </Text>
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 16 }}>
                  Verify your identity
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginVertical: 8 }}>
                  Before you book or host on Airbnb, you must complete this step.
                </Text>
              </View>
            </View>
          </View>

          {/* Right Section */}
          <View
            contentContainerStyle={{
              padding: 16,
              backgroundColor: '#f9f9f9',
            }}
          >
            {/* Main Section */}
            <View
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#ddd',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: '600' }}>About Bazil</Text>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: '#333',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              {[
                { label: 'Fullname', name: 'fullName', value: updatedData.fullName || userInfo.fullName || '' },
                { label: 'User Name', name: 'username', value: updatedData.username || userInfo.username || '' },
                { label: 'Phone Number', name: 'phoneNumber', value: updatedData.phoneNumber || userInfo.phoneNumber || '', keyboardType: 'numeric', maxLength: 11 },
                { label: 'About', name: 'about', value: updatedData.about || userInfo.about || '' },
                { label: 'Occupation', name: 'occupation', value: updatedData.occupation || userInfo.occupation || '' },
              ].map((field, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700', marginBottom: 4 }}>{field.label}:</Text>
                  <TextInput
                    style={{
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    placeholder={`Enter ${field.label}`}
                    value={field.value}
                    onChangeText={(value) => handleChange(field.name, value)}
                    keyboardType={field.keyboardType || 'default'}
                    maxLength={field.maxLength}
                  />
                </View>
              ))}

              {/* Location Fields */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '700', marginBottom: 4 }}>Location:</Text>
                <TextInput
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  placeholder="Enter City"
                  value={updatedData.location?.city || userInfo.location.city || ''}
                  onChangeText={(value) =>
                    handleChange('location', { ...updatedData.location, city: value })
                  }
                />
                <TextInput
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                  }}
                  placeholder="Enter Country"
                  value={updatedData.location?.country || userInfo.location.country || ''}
                  onChangeText={(value) =>
                    handleChange('location', { ...updatedData.location, country: value })
                  }
                />
              </View>
            </View>

            {/* Language and Interest Section */}
            {[
              { label: 'Languages', name: 'languages', data: updatedData.languages || userInfo.languages || [] },
              { label: 'Interests', name: 'interests', data: updatedData.interests || userInfo.interests || [] },
            ].map((section, sectionIndex) => (
              <View
                key={sectionIndex}
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '600' }}>{section.label}</Text>
                {section.data.map((item, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        padding: 8,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                      value={item}
                      onChangeText={(value) => updateFieldValue(section.name, index, value)}
                    />
                    <TouchableOpacity
                      onPress={() => handleArrayDelete(section.name, item)}
                      style={{
                        padding: 8,
                        backgroundColor: '#fde8e8',
                        borderRadius: 8,
                      }}
                    >
                      <FontAwesome5 name="trash" size={16} color="#b71c1c" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => addNewField(section.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 16,
                    backgroundColor: '#00796b',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                >
                  <FontAwesome5 name="plus-circle" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: '500' }}>Add {section.label}</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Social Links */}
            <View
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#ddd',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Social Links</Text>
              {['facebook', 'instagram', 'linkedin'].map((platform, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ width: 80, fontWeight: '600' }}>{platform}:</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                    placeholder={`Enter ${platform} link`}
                    value={updatedData.socialLinks?.[platform] || userInfo.socialLinks?.[platform] || ''}
                    onChangeText={(value) =>
                      setUpdatedData({
                        ...updatedData,
                        socialLinks: { ...updatedData.socialLinks, [platform]: value },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        :
        <ScrollView showsVerticalScrollIndicator={false} className='bg-[#f8f8f8]'>
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Image
                  source={{
                    uri: `/Avatars/${selectedAvatar || userInfo.profilePicture}.jpg`,
                  }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                /> 
                <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>
                  {userInfo.username}
                </Text>
                <Text
                  style={{
                    backgroundColor: "#6b7280",
                    color: "#f3f4f6",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 16,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {userInfo.role}
                </Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  {(() => {
                    const reviewDate = new Date(userInfo.createdAt);
                    const now = new Date();
                    const timeDiff = now - reviewDate;

                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const months = Math.floor(days / 30);
                    const years = Math.floor(days / 365);

                    if (years >= 1) {
                      return `${years} year${years > 1 ? "s" : ""} ago`;
                    } else if (months >= 1) {
                      return `${months} month${months > 1 ? "s" : ""} ago`;
                    } else {
                      return `${days} day${days > 1 ? "s" : ""} ago`;
                    }
                  })()}
                </Text>
                <Text style={{ color: "#e11d48", fontWeight: "700" }}>
                  On Airbnb
                </Text>
              </View>
            </View>

            <View
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
                {userInfo.username}'s confirmed information status
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <FontAwesome5
                  name="check-circle"
                  size={16}
                  color={userInfo.phoneNumber ? "green" : "#6b7280"}
                />
                <Text style={{ marginLeft: 8, fontSize: 14, color: "#6b7280" }}>
                  Phone number:{" "}
                  <Text style={{ fontWeight: "500" }}>
                    {userInfo.phoneNumber || "Not provided"}
                  </Text>
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 16 }}>
                  Verify your identity
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginVertical: 8 }}>
                  Before you book or host on Airbnb, you must complete this step.
                </Text>
              </View>
            </View>
          </View>

          <View
            contentContainerStyle={{
              padding: 16,
              backgroundColor: '#f9f9f9',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#ddd',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: '600' }}>About Bazil</Text>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={{
                    borderWidth: 2,
                    borderColor: '#555',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#555' }}>Edit profile</Text>
                </TouchableOpacity>
              </View>
              <Text>
                <Text style={{ fontWeight: '700' }}>Fullname:</Text> {userInfo.fullName}
              </Text>
              <Text>
                <Text style={{ fontWeight: '700' }}>Email:</Text> {userInfo.email}
              </Text>
              <Text>
                <Text style={{ fontWeight: '700' }}>About:</Text> {userInfo.about}
              </Text>
              <Text>
                <Text style={{ fontWeight: '700' }}>Occupation:</Text> {userInfo.occupation}
              </Text>
              <Text>
                <Text style={{ fontWeight: '700' }}>Location:</Text>{' '}
                {userInfo.location.city}, {userInfo.location.country}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#ddd',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Ask Me In</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {userInfo.languages && userInfo.languages.length > 0 ? (
                  userInfo.languages.map((language, index) => (
                    <Text
                      key={index}
                      style={{
                        backgroundColor: '#555',
                        color: '#fff',
                        paddingHorizontal: 15,
                        paddingVertical: 4,
                        borderRadius: 25,
                        fontSize: 12,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      {language}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: '#aaa' }}>No languages available.</Text>
                )}
              </View>

              <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 24, marginBottom: 8 }}>
                Interest
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {userInfo.interests && userInfo.interests.length > 0 ? (
                  userInfo.interests.map((interest, index) => (
                    <Text
                      key={index}
                      style={{
                        backgroundColor: '#eee',
                        color: '#555',
                        paddingHorizontal: 15,
                        paddingVertical: 4,
                        borderRadius: 25,
                        fontSize: 12,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      {interest}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: '#aaa' }}>No interests added.</Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                <Text style={{ fontWeight: '500', color: '#aa0000', marginRight: 15 }}>Found Me at:</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {userInfo.socialLinks?.facebook && (
                    <TouchableOpacity
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#1877f2',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5 name="facebook-f" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                  {userInfo.socialLinks?.instagram && (
                    <TouchableOpacity
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#E1306C',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5 name="instagram" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                  {userInfo.socialLinks?.linkedin && (
                    <TouchableOpacity
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: '#0077b5',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5 name="linkedin-in" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      }
      {/* Avatar Selection Modal 
      {isAvatarModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <motion.div
            className='bg-white p-6 rounded-lg shadow-lg'
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
          >
            <h2 className='text-xl font-bold mb-4'>Select an Avatar</h2>
            <div className='grid grid-cols-3 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 12 }).map((_, index) => (
                <img
                  key={index}
                  src={`/Avatars/${index + 1}.jpg`}
                  alt={`Avatar ${index + 1}`}
                  className='w-24 h-24 rounded-full border border-gray-300 shadow-md cursor-pointer hover:opacity-75'
                  onClick={() => selectAvatar(index + 1)}
                />
              ))}
            </div>
            <button
              onClick={closeAvatarModal}
              className='mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
            >
              Close
            </button>
          </motion.div>
        </div>
      )}*/}
    </View >
  );
};


export default Profile;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 15 },
  noTasksText: { textAlign: 'center', color: '#9CA3AF', fontSize: 16 },
  taskSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
});
# # Import the libraries
# import math
# import pandas_datareader as web
# import numpy as np
# import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# from keras.models import Sequential
# from keras.layers import Dense, LSTM import matplotlib.pyplot as plt
# plt.style.use('fivethirtyeight')

# # Get the stock quote
# df = web.DataReader('AAPL', data_source='yahoo', start='2012-01-01', end='2019-12-17')

# # Visualize the closing price history
# plt.figure(figsize=(16,8))
# plt.title('Close Price History')
# plt.plot(df 'Close'])
# plt.xlabel('Date', fontsize=18)
# plt.ylabel('Close Price USD ($)', fontsize=18)
# plt.show()

# # Create a new dataframe with only the 'Close column'
# data = df.filter(['Close'])
# # Convert the dataframe to a numpy array
# dataset = data.values

# # Get the number of rows to train the model on
# training_data_len =  math.ceil( len(dataset) * .8 )

# # Scale the data
# scaler = MinMaxScaler(feature_range=(0,1))
# scaled_data = scaler.fit_transform(dataset)

# #Create the training data set #Create the scaled training data set
# train_data = scaled_data[e:training_data_len , :]
# #Split the data into x train and y_train data sets
# x_train = []
# y_train = []
# for i in range(60, len(train_data)):
#     x_train.append(train_data[i-60:1, ©])
#     x_train.append (train_data[i, e])

# if i<= 60:
#     print(x_train)
#     print(y_train)

# print()

# 庭愷 sent Today at 9:34 PM
# #Convert the x train and y train to numpy arrays

# x_train, y_train = np.array(x_train), np.array(y_train)

# #Reshape the data

# x_train = np.reshape(x_train, (x_train.shape[@], 60, 1)) x_train.shape
# 庭愷 sent Today at 9:34 PM
# #Build the LSTM model

# model = Sequential()

# model.add(LSTM(50, return_sequences=True, input_shape= (x_train.shape[1], 1)))

# model.add(LSTM(50, return_sequences= False))

# model.add(Dense(25))

# model.add(Dense(1))
# 庭愷 sent Today at 9:34 PM
# #Compile the model

# model.compile(optimizer='adam', loss='mean_squared error')
# 庭愷 sent Today at 9:34 PM
# #Train the model

# model.fit(x_train, y_train, batch_size=1, epochs=1)

# 庭愷 sent Today at 9:35 PM
# #Create the testing data set

# #Create a new array containing scaled values from index 1543 to 2003

# test_data = scaled_data[training_data len - 60: , 🙂 #Create the data sets

# x_test and y_test

# x_test = []

# y_test = dataset[training_data len:, 🙂

# for i in range (60, len(test_data)):

# x_test.append (test_data[i-60:i, e])

# 庭愷 sent Today at 9:40 PM
# #Convert the data to a numpy array x_test = np.array(x_test)
# 庭愷 sent Today at 9:40 PM
# #Reshape the data

# x_test = np.reshape(x_test, (x_test.shape[@], x_test. shape[1], 1))
# 庭愷 sent Today at 9:40 PM
# #Get the models predicted price values predictions = model.predict(x_test) predictions scaler.inverse transform(predictions)
# 庭愷 sent Today at 9:40 PM
# #Get the root mean squared error (RMSE)

# rmse - np. sqrt( np.mean( predictions - y_test )**2 ) rmse

# 庭愷 sent Today at 9:42 PM
# #Plot the data

# train = data[:training data_len] valid = data[training_data_len: ]

# valid[ "Predictions ] predictions

# #Visualize the data

# plt.figure(figsize=(16,8))

# plt.title('Model')

# plt.xlabel('Date', fontsize=18) plt.ylabel ('Close Price USD ($)', fontsize=18)

# plt.plot (train[ 'Close ])

# plt.plot(valid[['Close', Predictions']]) plt.legend(['Train', Val', Predictions'], loc='lower right)

# plt.show()

# 庭愷 sent Today at 9:47 PM
# #Get the quote

# apple_quote = web.DataReader('AAPL', data_source='yahoo', start='2012-01-01', end='2019-12-17')

# #Create a new dataframe

# new_df = apple_quote.filter(['Close' ]) #Get teh last 60 day closing price values and convert the dataframe to an array

# last_60_days = new_df[-60:].values

# #Scale the data to be values between e and 1

# last 60 days scaled = scaler.transform(last 60 days)

# #Create an empty list

# X_test = []

# #Append teh past 60 days.

# X_test.append(last_60_days_scaled)

# #Convert the X_test data set to a numpy array

# X_test = np.array(X_test)

# #Reshape the data

# X_test = np.reshape (X_test, (x_test.shape[@], X_test. shape[1], 1))

# #Get the predicted scaled price

# pred price = model.predict(X_test)

# #undo the scaling

# pred price = scaler.inverse_transform(pred_price)

# print (pred_price)

# 庭愷 sent Today at 9:48 PM
# #Get the quote

# apple_quote2 = web.DataReader('AAPL, data_source='yahoo', start='2019-12-18', end='2019-12-18)

# print(apple_quote2[Close'])

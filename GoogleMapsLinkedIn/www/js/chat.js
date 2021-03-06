var params, chatUser, chatService, recipientID;


var jd = true;
console.log(self.location.search);
var user1 = self.location.search.split('=')[1].split('?')[0].replace(/%20/g, " ");
console.log(user1);
var user2 = self.location.search.split('user2=')[1].split('?')[0].replace(/%20/g, " ");
console.log(user2);
var rest = self.location.search.split('=')[3].replace(/%20/g, " ");
console.log(rest);

// Storage QB user ids by their logins
var users = {
	user1: '1762566',
	user2: '1762569'
};

$(document).ready(function() {
	// Web SDK initialization
	QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret);
	
	// QuickBlox session creation
	QB.createSession(function(err, result) {
		if (err) {
			console.log(err.detail);
		} else {
			$('#loginForm').modal({
				backdrop: 'static',
				keyboard: false
			});
			
			$('.tooltip-title').tooltip();
			changeInputFileBehavior();
			updateTime();
			
			// events
			//$('#loginForm button').click(login);
			login(user1);
			$('#logout').click(logout);
			$('.attach').on('click', '.close', closeFile);
			$('.chat input:text').keydown(startTyping);
			$('.sendMessage').click(makeMessage);
		}
	});
	
	window.onresize = function() {
		changeHeightChatBlock();
	};
});

function login(un) {
	$('#loginForm button').hide();
	$('#loginForm .progress').show();
	if(rest != "blah"){
		console.log("hey u1");
		params = {
			login: 'user1',
			password: 'testtest' // default password
		};
	}
	else{
		console.log("hey u2");
		params = {
			login: 'user2',
			password: 'testtest' // default password
		};
		jd = false;
	}
	
	// chat user authentication
	QB.login(params, function(err, result) {
		if (err) {
			onConnectFailed();
			console.log(err.detail);
		} else {
			chatUser = {
				id: result.id,
				login: params.login,
				pass: params.password
			};
			
			connectChat();
		}
	});
}

function connectChat() {
	// set parameters of Chat object
	params = {
		onConnectFailed: onConnectFailed,
		onConnectSuccess: onConnectSuccess,
		onConnectClosed: onConnectClosed,
		onChatMessage: onChatMessage,
		onChatState: onChatState,

		debug: false
	};
	
	chatService = new QBChat(params);
	
	// connect to QB chat service
	chatService.connect(chatUser);
	console.log(chatUser);
}

function startTyping() {
	if (chatUser.isTyping) return true;
	
	var message = {
		state: 'composing',
		type: 'chat',
		extension: {
			nick: chatUser.login
		}
	};
	
	// send 'composing' as chat state notification
	chatService.sendMessage(recipientID, message);
	
	chatUser.isTyping = true;
	setTimeout(stopTyping, 5 * 1000);
}

function stopTyping() {
	if (!chatUser.isTyping) return true;
	
	var message = {
		state: 'paused',
		type: 'chat',
		extension: {
			nick: chatUser.login
		}
	};
	
	// send 'paused' as chat state notification
	chatService.sendMessage(recipientID, message);
	
	chatUser.isTyping = false;
}

function makeMessage(event) {
	event.preventDefault();
	var file, text;
	
	file = $('input:file')[0].files[0];
	text = $('.chat input:text').val();
	
	// check if user did not leave the empty field
	if (trim(text)) {
		
		// check if user has uploaded file
		if (file) {
			$('.chat .input-group').hide();
			$('.file-loading').show();
			closeFile();
			
			QB.content.createAndUpload({file: file, 'public': true}, function(err, result) {
				if (err) {
					console.log(err.detail);
				} else {
					$('.file-loading').hide();
					$('.chat .input-group').show();
					sendMessage(text, result.name, result.uid);
				}
			});
		} else {
			sendMessage(text);
		}
	}
}

function sendMessage(text, fileName, fileUID) {
	stopTyping();
	
	var message = {
		body: text,
		type: 'chat',
		extension: {
			nick: chatUser.login
		}
	};
	
	if (fileName && fileUID) {
		message.extension.fileName = fileName;
		message.extension.fileUID = fileUID;
	}
	
	// send user message
	chatService.sendMessage(recipientID, message);
	
	showMessage(message.body, new Date().toISOString(), message.extension);
	$('.chat input:text').val('');
}

function showMessage(body, time, extension) {
	var html, url, selector = $('.chat .messages');
	
	html = '<section class="message">';
	var name;
	if(extension.nick == "user2") name = user2;
	else name = user1;
	html += '<header><b>' + name + '</b>';
	html += '<time datetime="' + time + '">' + $.timeago(time) + '</time></header>';
	html += '<div class="message-description">' + QBChatHelpers.parser(body) + '</div>';
	
	// get attached file
	if (extension.fileName && extension.fileUID) {
		url = QBChatHelpers.getLinkOnFile(extension.fileUID);
		html += '<footer class="message-attach"><span class="glyphicon glyphicon-paperclip"></span> ';
		html += '<a href="' + url + '" target="_blank">' + extension.fileName + '</a></footer>';
	}
	
	html += '</section>';
	
	if ($('.typing-message')[0])
		$('.typing-message').before(html);
	else
		selector.append(html);
	
	selector.find('.message:even').addClass('white');
	selector.scrollTo('*:last', 0);
}

function logout() {
	// close the connection
	chatService.disconnect();
}

/* Callbacks
----------------------------------------------------------*/
function onConnectFailed() {
	$('#loginForm .progress').hide();
	$('#loginForm button').show();
}

function onConnectSuccess() {
	var opponent = chooseOpponent(chatUser.login);
	console.log(chatUser.login);
	$('#loginForm').modal('hide');
	$('#wrap').show();
	console.log("jd is "+jd);
	console.log('user1 should be: '+user1);
	console.log('user2 should be: '+user2);

	$('.panel-title .opponent').text(!jd?user1:user2);
	$('.chat .chat-user-list').html('<li class="list-group-item"><span class="glyphicon glyphicon-user"></span> ' + opponent + '</li>');
	$('.chat .messages').empty();
	if(jd){
		var text = 'Hi '+user2+' I want to invite you to '+rest;
		sendMessage(text);
	}
	$('.chat input:text').focus().val('');
	changeHeightChatBlock();
	
	recipientID = users[opponent];
	
	// create a timer that will send presence each 60 seconds
	chatService.startAutoSendPresence(60);
}

function onConnectClosed() {
	$('#wrap').hide();
	$('#loginForm').modal('show');
	$('#loginForm .progress').hide();
	$('#loginForm button').show();
	
	chatUser = null;
	chatService = null;
}

function onChatMessage(senderID, message) {
	showMessage(message.body, message.time, message.extension);
}

function onChatState(senderID, message) {
	switch (message.state) {
	case 'composing':
		//$('.chat .messages').append('<div class="typing-message">' + /*message.extension.nick +*/ ' ...</div>');
		$('.chat .messages').scrollTo('*:last', 0);
		break;
	case 'paused':
		QBChatHelpers.removeTypingMessage($('.typing-message'), message.extension.nick);
		break;
	}
}

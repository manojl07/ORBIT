ORBIT

BACKEND – AUTHENTICATION
1.	Server.js – this is the starting point of my application where ill require dotenv config to read the my env file then ill require app where app.js is required and it has the setup of express and helmet is required here then cors, morgan, cookieParser, then all the routes are imported here – authRouter, postRouter, commentRouter, userRouter then app is declared express() then app.use helmet what it does explain me then app.use cors policy this is done because as in frontend we use other port so the request to pass we use cors policy still explain the depth for me next as we pass our response as json so we need express.json to read those data then app.use express.urlencoded why this don’t know then all the routers are declared the base routes then an base url for / that API  is running This was all about app.js now lets come back to our server.js where this app is required then a variable function is created as startServer where in a try catch I call connectDB fnc this goes to my config/db.js where mongoose is required and connectDB function is created then a try catch inside try where mongoose.connect is called and database is connected to the server then in catch if there is any error we do process.exit(1) what this actually do I don’t know then we come back to our server.js then app.listen  we do with port and log server is running in catch block we log the error then startServer function is called directly so when the server.js runs it calls app.js then db.js then server and db gets connected 
2.	Routes – next we’ll to routes where this where all the api’s get hit or called via routes first is register route where it has upload.single(“profileImg”), validate(registerSchema), registerController lets break down each first – upload.single this is function in my middleware called upload.middleware.js where require multer and path multer is responsible for files uploads as express cant read files so as multipart formdata to read and parse these multer is used then path is required what is does? Then storage variable is declared as multer.memoryStorage() explain this then a new variable allowedExtension array is created where a set of image formats are declared as images can jpg, png etc so then, in a new variable upload multer is declared with object parameter as storage, limits where limit is fileSize within 5mb, fileFileter(req, file,cb) where inside here first I convert extensions name to lower case and then file.mimetype.startsWith("image/") does not rename the file. It checks whether the uploaded file's MIME type belongs to the image category, such as image/jpeg, image/png, or image/webp, and returns true or false. isGenericMime checks whether the uploaded file's MIME type is the generic application/octet-stream. This means the file is being treated as generic binary data rather than being identified as a specific type such as image/jpeg. It returns true or false and is used as a fallback together with the file extension check.
3.	Validate – validate(schema) is a reusable higher-order middleware that receives a zod schema and returns an express middleware. It uses schema.safeParse(re	q.body) to validate the incoming request body without throwing an exception. If validation fails, it collects the zod error messages , creates an ApiError with status 400 and passes it to express using next(error) ,so the request does not continue to the controller. If validation succeeds, req.body is replaced with the validated/transformed result.data, and next() continues the request pipeline. 
The main purpose is to keep validation separate from business logic  and alow the same middleware to be reused with different schemas such as registerSchema , loginSchema etc

4.	registerController – The controller handles the HTTP request and response for registration. It is wrapped with asnycHandler, which catches rejected promises and passes error to express’s error handler instead of requiring try/catch in every controller
The controller calls authService.register() and passes the requied registration data, …req.body uses the object spread operator to copy all validated fields from req.body into the object. profileImg : req.file passes the file parsed by multer. Crypto.ramdomUUID generates a unique deviceId for the session. Req.get(user-agent) reads the client’s user-agent  HTTP header. And req.ip provides the request IP address.
This service returns the user and authentication/session information. The controller stores the access token , refreshtoken and device ID in cookies . accessCookieOptions and refreshCookieOptions are centralized cookie configuration so the same cookie settings canbe reused consistently.
Finally, the controller returns HTTP 201 created using the custom ApiResponse class and sends the registration result to the  frontend. 
5.	authService.register – This function contains the business logic for user  registration. It receives the validated registration fields from req.body aling with the uploaded profile Image and session information such as deviceId, userAgent, and ipAddress

First, it checks the User model to see whether the email or username already exists. If a user exists, it throws an ApiError with status 409 conflicts.

If a profile image was provided, it calls uploadImage() from image.service, which uploads the file to ImageKit and returns an imageUrl for displaying the image and an imageFileId for managing/deleting the ImageKit file later. Both are stored in the user document for different purposes. 

Then userData is created and the new user is stored using User.create(). Mongoose’s password middleware hashes the password before saving it. 

After the user is created, createTokens(user) generates an access token and refresh token. The access token is used for authenticated API requests, while the refresh token is used to obtain a new access token after expiration.

A session is then created using createSesion(). The refresh token is hashed with SHA-256 before being stored in the Session collection. The session also stores the user ID, device ID , user-agent, IP address , and a 7-day expiration time. Storing the hash rather than the raw refresh token helps protect the token if the database is exposed. 

Finally, the service returns the sanitized user info, access token, refresh token , session ID  and device ID to the controller. 

6.	Login API – The login route first passes through validate(loginSchema) and then loginController. The controller is wrapped with asyncHandler to handle asynchronous errors. It calls authService.login() and passes the user’s identifier, password, a newly generated deviceId, userAgent and ipAddress.
authService.login() fist calls findUser(identifier), which searchs the User model by either email or username. It uses .select(“+password”) because the password field normally hidden with select: Invalid credentials error is thrown. 

The submitted password is then checked using user.comparePassword(password), which compares it with the stored bcrypt hash. It the password is incorrect, another 401 Invalid credentials error is thrown. 

After successful authentication , createTokens(user) generates an access token and refresh token. createSession() then createas a server-side using the user,  refresh token, device ID, user-agent, and IP address. The refresh token us hashed with SHA-256 before being stored in the session database. The session expires after 7 days. 

Finally the service returns the user, access token  and refresh token , session ID, and device ID. The controller stores the access token and refresh token in cookies using centralized cookie options and returns a 200 Login successful response to the frontend.

7.	getMe() API – The /me route is protected by authMiddleware, which authenticates the request before allowing getMeController() to run. 

authMiddleware first checks for an access token in the Authorization header. A typical header is Authorization: Bearer TOKEN . req.headers.authorization reads this header, startsWith(“Bearer “) verifies its format and split(“  “)[1] extracts the actual token after the Bearer prefix. If no header token is available, the middleware checks req.cookies.accessToken.
If no token is found, it returns 401 Unauthorized. If a token is found , jwt.verify(token, JWT_ACCESS_SECRET) verifies the JWT’s signature and validate and returns the decoded payload. 

The decoded payload contains the user’s ID, so the middleware attaches it to the request using req.user = decoded. This is how later middlewares/controllers get access to the authenticated user’s ID through req.user.id. Finally , next() allows the request to continue to getMeController.
getMeController calls authService.getMe(req.user.id), passing the ID that was attached by authMiddleware. The service finds the user using Post.countDocuments({user:userId}). Finally, it returns the sanitized user data along with postsCount.
…sanitizedUser(user) is the object  spred operator, which copies the properties returned by sanitizedUser() into a new object and then adds postsCount.

8.	Refresh API – The refresh API is used to obtain a new access token after the short-lived access token expires, without requiring the user to login again. The refresh route doesnot use authMiddleware because the access token may already be expired. Instead, it authenticates the request using the refresh token stored in the refreshToken cookie.
refreshController receives the refresh token from req.cookies.refreshToken, along with deviceId, userAgent, and ipAddress, and passes them to authService.refresh().
The refresh service first checks whether the refresh token exists. It then calls verifyRefreshToken() to verify JWT and obtain its decoded payload, including the user ID. The raw refresh token is then hased with SHA-256 using hashToken(). This hash is compared with the tokenHash stored in the Session collection. If no matching session exists, the refresh request is rejected.
After the session is validated, the user, is fetched using decoded.id. createTokens(user) then generates a new access token and a new access token and a new refresh token. The old session is deleted, and a new session is created using the new refresh token. This is refresh-token rotation,  where the old refresh token is invalidated and replaced with a new one. 
Finally, the controller stores the new access token and refresh token in cookies and returns a 200 Token refreshed response containing the new session ID.
The access token is short-lived, around 15min while the refresh token/session is long-lived, around 7 days. Therefore, the user does not refresh every 15 min manually; the client only calls the refresh endpoint when it needs a new  access token. Once the refresh token/session expires or is revoked, the user must authenticate again.

9.	Logout API – The logout route calls logoutController, which is wrapped with asyncHandler so asynchronous errors are passed to the global error handler. The controller gets the current refresh token from req.cookies.refreshToken and passes it to authService.logout().

In the service layer, the refresh token is hashed using the same hashToken() SHA-256 function used when the session was created. Session.findOneAndDelete({tokenHash}) finds and removes the matching sessionfrom MongoDB, which invalidates the refresh-token session on the server.
After the service succeeds, the controller uses res.clearCookies to remove the accessToken, refreshToken, and deviceId cookies from the browser. Finally, it returns a 200 response  with “Logged out successfully”.

Therefore logout has two parts: delete the server-side session and clear the authentication cookies in the browser.

10.	LogoutAll API – In auth.route.js, the logout-all route uses authMiddleware because logout-all needs to know which authenticated user is requesting the operation. authMiddleware verifies the access token and stores the decoded JWT payload in req.user, so the controller can pass req.user.id to authService.logoutAll().
The controller then calls: authService.logoutAll(req.user.id) and returns 200 Logged out from all devices. 

In the service layer, logoutAll(userId) uses: Session.deleteMany({user: userId}) because one user can have multiple sessions across multiple devices. deleteMany() deletes all session decuments belonging to that user, which invalidates all their refresh tokens/sessions at once. The service then returns true to indicate the operation succeeded. 

11.	Update Profile API – When the update-profile API  is called, authMiddleware first verifies the access token and gives us req.user.id, because only an authenticated user should update a profile. Then upload.single(“profileImg”) handles the optional profile image. Multer checks the file-size limit and the file’s reported MIME type/extension and, because memoryStorage() is used, stores the accepted file temporarily in RAM as req.file.buffer. Next, validate(updateProfileSchema) validates the request body. If everything passes, updateProfileController calls authService.updateProfile() with the userId, bio, and uploaded profileImg.

In the service, the user is first fetched using userId; if no user exists, a 404 User not found error is thrown. Then if (bio !== undefined) checks whether the client actually sent a bio. This is important because the endpoint is a partial update: if bio was not provided, the existing bio should remain unchanged. If a new profileImg exists, the old imageKit image is deleted using its file ID, then uploadImage(profileImg, “/orbit/profile-images”) uploads the new image is deleted using its file ID, then uploadImage(profileImg, “/orbit/profile-images”) uploads the new image to ImageKit. The returned image URL  and file ID are attacked to the user, and user.save() stores the changes in MongoDB. Finally Post.countDocuments({user: user._id}) counts the user’s posts, and the service returns …sanitizeUser(user) along with postsCount.

Posts API’s

1.	Create Post API – The entry point is post.route.js, where the / route first uses authMiddleware to verify the access token and identify the user through req.user.id, then upload.single(“image”) handles the uploaded image using multer. Since multer is configured with memoryStorage(), the accepted file is temporarily stored in RAM and attached to req.file; the actual image binary data is available in req.file.buffer. Multer  also applies the file-size and MIME/extension checks configured in the upload middleware. Next, validate(createPostSchema) validates the request body such as the caption. If everything is valid, the request reaches createePostController.

The controller calls postService.createPost() passes the caption, image, and userId. The service first checks if !image and throws an error because a post requires an image. Then uploadImage(image, “/orbit/post-images”) takes the multer file, uses its buffer, and uploads the actual image to ImageKit. ImageKit returns an imageUrl and imageFileId. The service then creates a new mongoDB Post document containing the caption, ImageKit iamge URL, ImageKit file ID , and user: userId. Finally, the created post is returned to the controller, which responds with 201 Post created successfully.

2.	DeletePost API – The delete-post request contains the postId in req.params.id First , authMiddleware verifies the access token because only an authenticated usershould be able to delete a post. After authentication, req.user.id contains the ID of the logged-in user. Then deletePostController calls postService.deletePost() and passes both req.params.id (the post ID) and req.user.id (the authenticated user’s ID), because the backend needs both the post to delete and the identity of the user attempting the deletion.

In the service layer, deletePost(postId, userId) first searches for the post using Post.findById(postId). If the post does not exist, it throws 404 Post not found. If it exists, an ownership check is performed by comparing the post’s user ID with the authenticated userId. If they do not match, a 403 error is thrown because users are only allowed to delete their own posts. Once ownership is confirmed, Post.findByIdDelete(postId) removes the post document from MongoDB. Then, if post.imageFileId exists, deleteImage(post.imageFileId) is called to remove the actual image from Imagekit. If ImageKit deletion fails , the error  is caught and logged using console.error, while the request can still complete. Finally the service returns true, allowing the controller to return a successful delete response.

3.	Get User posts API – The route uses the userId using params  and the user is authenticated via authMiddleware then after the token is verified it goes to getUserPostsController.

In controller postService.getUserPosts is called and in that as parameter object userId from params, currentUserId from req.user.id and page Number(req.query.page) || 1 and limit Number(req.query.limit) || 12 is passed to the service and all this are stored in result variable 

In the service layer the getUserPosts function passes the userId, currentUserId, page=1 and limit = 12 these are passed. Here skip = (page-1) * limit this is done how many posts to skip for pagination, then Promise.all() runs three database queries in parallel: first, Post.find({user: userId}) fetches the selected user’s posts, populates only user’s username and profileImg, sorts by newest first using createdAt: -1 , skips the previous pages, limits the result to the requested number of posts, and uses lean() to return plain js objects. Second, Post.countDocuments({user: userId}) gets the total number of posts for pagination. Third, Like.find({user: currentUserID }).select(“post”) gets the post IDs liked by the currently logged-in user.

Then userLikes.map() extracts those post IDs and converts them to strings, and new Set() stores them in likedPosts so we can quickly check whether a post was liked. Posts.map() then creates a new object for every post using …post and adds isLiked: likedPosts.has(post._id.toString()). Finally, every formatted post is passed through sanitizePost, and the function returns the posts together with pagination information: current page, limit, total posts, and totalPages, where Math.ceil(total/limit) calculates how many pages are needed.

4.	Feed API –  In the route it checks for access token via authMiddleware when the user is authenticated the controller is invoked.

In controller getFeedController runs where in result variable postService.getFeed is called where userId req.user?.id page=1 and limit = 10 is passed to the service layer.

In service layer getFeed fetches a paginated list of all posts for the feed and adds information specific to the currently logged-in user. Promise.all() runs three independent quries in parallel: Post.find() -> posts – fetches the actual post documents for the current page. Populate(“user”, “username profileImg followers”) does not remove or limit the Post fields. The Post still contains fields such as caption, imageUrl, imageFileId and createdAt; populate() only takes the user objectId stored inside the Post and fetches the selected fields (username, profileImg, followers) from that User document. Sorting, skipping,, and limiting implement pagination, and lean() returns JS objects. Post.countDocument() -> total – Does not fetch posts. It simply counts how many Post documents exist in MongoDB in total. This is used to calculate totalPages. Like.find({user: userId}).select(“post”) -> userLikes – Searches the Like collection for all like documents belonging to the currently logged-in user and returns only the post field. This tells us which posts the current user has liked. Then the liked post IDs are converted into a Set called likedPosts. Each fetched post is processed with posts.map(); isLiked checks whether the current post’s id exists inside the post owner’s populated array. Finally the posts are sanitized and returned with pagination data.

5.	Toggle Like API – The route first checks the tokens via authMiddleware then the toggleLikeController is called.

In controller using the result variable postService.toggleLike(req.params.postId, req.user.id) the postId and logged in userId is passed to service function and returns response as 200 Like updated and result is passed.

In service layer, the toggleLike function gets postId and userId where using the post variable the particular post is fetched with postId and if !post throw 404 Post not found then checks for existing like by Like.findOne({user:userId, post: postId}) if the user has liked it shows true or false I guess then if its an existing like then post.likeCount -= 1 we do and save the post and return liked: false and likesCount: post.likesCount if its not an existing like then create a like using the userId and postId then, increase the count post.likesCount += 1; then save the post and return liked: true, likesCount: post.likesCount

6.	Create Comment API – authMiddleware first validates the access token so we know the identity of the user creating the comment. Then createCommentController calls commentService.createComment() and passes postId from req.params.postId, userId from req.user.id and content from req.body.content.

In the service layer, the post is first fetched using Post.findById(postId) to make sure the target post exist. Then a new comment document is created with content, user: userId and post: postId. The comment is stored in the comment collection, while post.commetCount += 1 increments the cached comment count on the Post document and post.save() saves that updated Post. 

After creating the comment, comment.populate(“user”, “username profileImg”) uses the user objectId refrence stored in the comment to fetch the corresponding User’s username and profileImg. It foes not fetch the while User document and does not change what is stored in MongoDB; it only expands the reference in the returned Mongoose object. Finally, the service returns thecomment information, including the comment ID, content, populated user information, and createdAt.

7.	Get Comments API – The route receives the postId  through req.params.postId and calls getCommentController; In the controller, commentService.getComment(req.params.postId) passes the postID to the service, and the returned result is sent back with 200 Comments fetched successfully.

In the service layer, Comment.find({post: postId}) fetches all comments whose post field matches the requested post ID; .populate(“user”, “username profileImg”) uses the User objectId stored in each Comment to fetch the related user’s username and profileImg without returning the whole User document; .sort({createdAt: -1}) sorts the comments from newest to oldest.

The resulting comments are then mapped to create a clean response containing each comment’s id, content, the user’s id, username, profileImg and createdAt.

8.	Delete Comment API – The route uses authMiddleware to verify the access token because only an authenticated user should be able to delte a comment; deleteCommentController calls commentService.deleteComment() and passes commentId from req.params.commentId and userId from req.user.id, so the service knows which comment is being deleted and who is deleting it. 

In the service, comment.findbyid(commentId) finds the comment. If it does not exist, 404 Comment  not found is thrown, Then comment.user.toString() !== userId checks ownership; if the authenticated user is not the comment’s owner, 403 Unauthorized is thrown.

After ownership is verified, the Post’s comment count is decreased using: await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1}}); comment.post gives the ID of the post to which the comment belong, findByIdAndUpdate() finds that post, and $inc: {commentCount: -1} decreases its commentsCount by 1; await waits for this asynchronous MongoDB update to complete. Then await Comment.findByIdAndDelete(commentId) finds the comment by its ID and permanently removes it from the Comment collection. The two database operations are needed because deleting the comment removes the actual comment, while updating commentsCount keeps the Post’s stored comment count correct.


User API’s
1.	Search API – The search route uses authMiddleware to authenticate the logged-in user and then passes the request to searchUsersController. The controller gets the search text from req.query.q and calls userService.searchUsers(req.query.q).

In the service, query?.trim() removes whitespaces from the beginning and end of the search query; if !trimmed query returns an empty array when no search text is provided. Then User.find() searches the username field using: username: ({$regex: trimmedQuery, $options: “I”}) $regex means MongoDB should search the username using the supplied text as a regular-expression pattern; $options: “I” makes that regex case-insensitive, so jo, JO and Jo can match the same usernames; .select(“username profileImg”) does not control the search; it only specifies which fields should be returned from the matching users; .sort({username: 1}) sorts the results alphabetically by username, where 1 means ascending order; .limit(10) restricts the response to atmost 10 matching users.

The user’s variable therefore contains an array of matching user documents. Finally, users.map() converts each User document into a simpler object containing its id, username and profileImg; which is returned to the controller.

2.	Get followers API – The route authenticates the current user and the controller calls userService.getFollowers() with profileUserId and currentUserId. In the service, User.findById(profileUserId) finds the profile user. The User document contains a followers array, but those values are User objectId references , not the complete follower documents. 

.populate(“followers”, “username profileImg followers”) tells Mongoose to take the objectids inside the profile user’s followers array, find those corresponding User documents, and replace each objectId with selected fields from that User: Id, username, profileImg and that follower’s own followers array.

After checking that the profile user exists, user.followers.map() loops through each populated follower and creates a smaller response containing the follower’s id, username, profileImg; follower.followers.some() checks whether the currently logged-in user’s ID exists inside that follower’s own followers array. If it exists, isFollowing is true; otherwise it is false.
Therefore, isFollowing means “Is the current logged-in user following this person in the follower list?”

3.	Get Following API – The route authenticates the current user using authMiddleware, then getFollowingController calls userService.getFollowing() with profileUserId from req.params.userId and currentUserId from req.user.id

In the service, User.findById(profileUserId) finds the profile user. The user’s following array contains objectId references to the users they follow; .populate(“following”, “username profileImg followers”) uses those objectIds to look up the corresponding user document and replaces the IDs with selected user data: username, profileImg and each followed user’s own followers array.

After confirming the profile user exists, user.following.map() loops through every user that the profile user follows and returns their id, username and profileImg; followingUser.followers.some() then checks whether the currently logged-in user’s ID exists inside that person’s followers array. If it exists, isFollowing is true; otherwise it is flase. This allows the frontend to display whether the logged-in user is currently following each person.

Main difference: followers API starts from profileUser.follwers, while following API starts from profileUser.following 

4.	Get User Profile API - The route authenticates the current user is authMiddleware is included, then calls getUserProfileController. The controller calls userService.getUserProfile() and passes profileUserId (the user whose profile is being viewed) and currentUserId (the logged-in user ID).

In the service, Promise.all() performs two database operations in parallel. User.findById(profileUserId) fetches the profile user’s User document. Post.countDocument({user: profileUserId}) does not fetch the user’s posts; it only counts how many posts belong to that user and stores that number as postsCount. The actual posts are fetched are fetched separately through the getUserPosts API so that they can be paginated instead of loading all posts when the profile itself is requested. 

After confirming that the user exists, isOwnProfile compares the profile user’s ID with currentUserId to determine whether the logged-in user is viewing their own profile; isFollowing uses user.followers.some() to check wheather the logged-in user’s ID exists inside the profile user’s followers array. If a matching follower ID is found, isFollowing is true; otherwise it is false.

Finally, sanitizeUserProfile(user, {}) creates the safe profile response and adds postsCount, isOwnProfile and isFollowing

5.	Toggle Follow API – In the route file the route first validates the user then the request is passed to the controller. Inside the toggleFollowController userService.toggleFollow is called with profileUserId and currentUserId and all this is stored in result variable and returns the result with response status 200 User Followed or User Unfollowed.

In service layer, it first checks whether both IDs are the same; if they are, a 400 You cannot follow yourself error is thrown. Then Promise.all() fetches both users in parallel: currentUser and targetUser. If either user does not exist, an appropriate 404 error is thrown.

currentUser.following.some() checks whether the target user’s id already exists in the current user’s following array. The result is stored in alreadyFollowing.

If alreadyFollowing is true, the user is already following the target, so the operation becomes unfollow; .pull() removes the target user’s ID from currentUser.following and removes current user’s ID from targetUser.followers.

If alreadyFollowing is false, the operation becomes follow; .push() adds the target user’s ID to currentUser.following and adds the current user’s ID to targetUser.followers.

Both modified User document are then saved using await Promise.all([currentUser.save(), targetUser.save()]). Finally, following: !alreadyFollowing returns the new follow state because alreadyFollowing represents the old state; followersCount and followingCount return the updated array lengths so the frontend can immediately update the profile counts.


FRONTEND
Your frontend learning order
I recommend this exact sequence:
Frontend Foundation
1. Project structure
2. main.jsx / App.jsx
3. Providers
4. React Router
5. Layouts
6. Route protection

State and data
7. AuthContext
8. useAuth
9. Axios instance
10. API files
11. React Query
12. QueryClient
13. Query vs Mutation
14. Cache / invalidation

Reusable logic
15. Custom hooks
16. Services
17. Utils

Pages
18. Login/Register
19. Home/Feed
20. Profile
21. Search
22. Followers/Following
23. Post details/comments

Feature tracing
24. Login
25. Logout
26. Refresh
27. Feed
28. Create post
29. Like
30. Comment
31. Follow
32. Profile
33. Search

Frontend Foundation
1.	Project Structure – The frontend is divided into multiple folders, with each folder responsible for a different part of the application,

API – Contains the frontend functions that communicate with the backend through HTTP requests. Axios.js provides the central axios configuration/client, while auth.api.js , post.api.js , comment.api.js and user.api.js contain API functions for their respective backend resources.
 
COMPONENTS – Contains reusable UI pieces that can be used across pages, organized into areas such as comment, feed, post, profile, search, social and UI components.
 
CONSTANTS -  Contains reusable fixed values/configuration so they don’t have to be hardcoded repeatedly throughout the application.

CONTEXT – Provides shared/global application state or data to components without needing to pass it though every level using props. AuthContext is used for authentication-related state.

HOOKS – Contains reusable react logic, mainly custom hooks such as authentication, API mutations/queries, and other feature-specific behavior.

LAYOUTS – Contains application-level structure and route/authentication-related components. MainLayout provides shared page structure, Navbar provides common navigation UI, ProtectedRoute controls access to authenticated pages, PublicRoute controls access to public/auth pages and AuthInitializer handles authentication/session initialization when the application starts.

PAGES – Contains complete screen/page-level components such as Feed, Login, Register, and profile. Pages generally combine multiple reusable components to form a complete application screen.
 
ROUTES – Defines the frontend URL to component routing and determines which page/layout should be rendered for each URL.

SERVICES – Contains reusable application/service-level functions. The exact responsibility depends on the service, so the individual files need to be studied before defining it more precisely.
 
UTILS – Contains general-purpose reusable helper functions that are not tied to a specific UI component.

 
2.	Main.jsx and App.jsx – main.jsx is the actual entry point of the React application. It finds the root element from index.html, creates a react root using createRoot(), and returns the entire application inside it.

StrictMode enables additional react development checks. QueryClient creates the TanStack Query client, which manahes server-state operations such as query data, caching, loading, errors, refetching and mutations. QueryClientProvider provides this QueryClient to all components inside it, allowing them to use TanStack Query hooks.

BrowserRouter provides React router functionality to the application, allowing components inside it to use routing features such as useNavigate, useParams, and route-based rendering. It does not specifically need to be placed in main.jsx; it simply needs to wrap the components that use react router. 

AuthProvider provides the global authentication context/state to the application, allowing components to access authentication information without prop drilling. AuthInitializer performs the authentication/session initialization work when the application starts and can access the AuthContext because it is inside AuthProvider.

App is the root react component rendered by main.jsx. In this project it mainly renders AppRoutes, which layout/page should appear for the current throughout the application can display toast notifications.

The nesting of these providers is important because each inner component can access the functionality provided by the wrappers around it.

3.	Providers – A Provider is a React component that makes shared state, data, or functionality available to components inside it. Providers are not APIs. APIs are used to communicate between the frontend and backend, while providers are used to share functionality/state within the react applicaton.
AuthProvider provides authentication-related global state through context API, while QueryClientProvider provides the TanStack Query QueryClient so components can use useQuery, useMutation and other TanStack query features 
API -> frontend <->backend communication
Provider -> shared functionality/state inside frontend 

AuthProvider/AuthContext.jsx – createContext creates the AuthContext object, which provides a mechanism for sharing authentication-related state across react components. AuthProvider is custom react component that receives children, meaning everything placed inside <AuthProvider>…</AuthProvider> is passed to it through the special children prop.

Inside AuthProvider, useState(null) creates the user state and setUser function. User stores the current authenticated user, while setUser updates it; isAuthLoading and setIsAuthLoading store whether the authentication initialization/checking process is still running; it initially starts as true.

AuthContext.Provider then makes user, setUser, isAuthLoading and setIsAuthLoading available to all components inside it though its value prop; {children} renders the components wrapped by the provider. 

useAuthContext() is a custom hook that internally calls useContext(AuthContext). It allows any component inside AuthProvider to easily access the shared authentication values without manually receiving them though props.

FLOW : createContext() -> AuthContext -> AuthProvider -> useState() stores auth state -> children can access it -> useAuthContext() -> component gets user/setUser/loading state

ONE SENTENCE TO LOCK IT IN – useState stores the authentication state, AuthContext.Provider shares that state, and useAuthContext() reads that shared state from components.

AuthInitializer – AuthInitializer is react component with two main responsibilities: one, Initialize authentication when the application starts. Second, react global  authentication termination/session-expiration events. 

First  useEffect – Initialize authentication
When authInitializer mounts, the first useEffect runs and calls initialize(). Initialize() calls getMe(), which asks the backend /auth/me endpoint for the currently authenticated user’s information.
If getMe() succeeds, setUser(response.data) stores the returned user information in AuthContext.
If the backend returns 401, setUser(null) means there is no valid authenticated session. For other errors, an error toast is shown and setUser(null) is also set. 
isAuthLoading starts as true because the application initially does not know whether the user is authenticated. The finally block sets setIsLoading(false) after the authentication check finishes, regardless of success or failure.
Mounted is a local flag referring to the AuthInitializer component instance. It starts as true. If the component is unmounted while the asynchronous getMe() request is still running, the cleanup function sets mounted = false. Therefore, checks such as if !mounted return prevent the old component instance from updating react state after it has been removed.

Second useEffect – global logout/session termination
The second useEffect registers a logout handler using registerLogoutHandler(). A handler is simply a function that is called to respond to a particular event.
The callback receives an object containing sessionExpired. This value tells the callback whether the authentication termination happened because the session is expired.
registerLogoutHandler(handler) stores the supplied callback in a global logoutHandler variable.
Later, another part of the authentication system can call that stored handler when it needs the frontend to perform global logout/session cleanup.
registerLogoutHandler returns another function called unregister. This function removes the registered handler; return unregister from useEffect tells react to call it when the effect is cleaned up/unmounted

4.	React Router – React router allows the react application to change the display UI based on the browser URL without performing a full browser page reload. BrowserRouter is placed in main.jsx so routing functionality is available to the application inside it. 

AppRoutes.jsx contains the application’s route configuration; <Routes> contains multiple <Route> components. Each Route uses path to specify which URL pattern should match and element to specify the react element tree that should be rendered when that path matches. 

/login and /register are wrapped in PublicRoute because they are authenticated /public pages. The / Feed route iswrapped in ProtectedRoute because the Feed requires authentication, and inside it MainLayout provides the common application structure before rendering Feed.

The /profile route renders the current user’s profile, while /profile/:userID renders the same Profile component for another user. :userId is a dynamic route parameter stored in the URL, and the Profile component can retrieve it using useParams().

5.	Layouts : MainLayout.jsx – MainLayout receives children because whatever is placed between <MainLayout>…</MainLayout> is automatically passed as the react children prop. For example , <MainLayout><Feed></MainLayout> means children is <Feed/>. This is not related to AuthContext; AuthContext is separately available because the whole application is rendered inside AuthProvider. Similarly, react query data/cache is available because the application is inside QueryClientProvider.

Inside MainLayout, isOpen and setIsOpen are created using useState(false). isOpen controls whether the createpostmodal should be displayed. MainLayout passes onOpenModal={() => setIsOpen(true)} to navbar and passes isOpen and onClose={() => setIsOpen(false)} to createpostmodal.

When the navbar + button is clicked, setOpen(false) closes the navbar’s profile dropdown. Then onOpenModal?.() calls the function provided by MainLayout, which executes setIsOpen(true). React updates the state from false to true and rerenders MainLayout. The createpostmodal now receives isOpen={true}.

CreatePostModal itself is already rendered as a component; changing isOpen does not invoke/create it. Instead, the code inside CreatePostModal checks the isOpen prop and decides what JSX to render. For example, if !isOpen return null means nothing is rendered when isOpen is false, while when it becomes true the modal JSX is rendered. When onClose() calls setIsOpen(false), the child receives isOpen={false} again and stops rendering the modal.

Navbar.jsx – navbar.jsx receives a prop onOpenModal coming from MainLayout.jsx here useAuth() is called to get the user, useLogout hook is used as const {logout, isLoggingout} = useLogout(); 
useLogout() : inside the useLogout file navigate is declared queryClient is declared and useAuth is declared and the mutation performs where mutationFn calls the logoutUser API and onSuccess a async function runs which clears the queryClient and setUser to null and toast as Logged out successfully, and navigate to login page why replace true explain. onError is declared for errors where it logs error Logout failed and error is passed and a toast and returns logout: mutation.mutateAsync, isLogginOut: mutate.isPending so these two return states im using in my navbar.
Next, open, setOpen useState is used for profile dropdown handling and menuRef using useRef(null)
A useEffect is used to handle the side clicks of the dropdown menu of profile where const handleOutSideClick where a event is passed and if menuRef.current &&  !menuRef.current.contains(event.target) then setOpen to false I didn’t get this if condition then document eventlistner on mousedown handleOutSideClick runs and the cleanup function returns document.removeeventlistener on mousedown and clears it 
Next, handleLogout() where it runs a async function where in try..catch logout() is called which calls the mutation.mutateAsync and logout is performed and setOpen is false if any error catch logs it 
When the profile btn is clicked onClick={(event) =>  event.stopPropogation(); setOpen((prev) => !prev} I didn’t get this and on next div also same event stopPropogation happens explain then, on link onClick to navigates to /profile and onClick runs a function where setOpen(false) so, it closes the dropdown and in the btn onClick handleLogout is called and when the logout is happening disabled is set If isLogginOut is happening where isLoggingout is mutate.isPending so.

CreatePostModal – where prop isOpen and onClose is passed for opening and closing of the postmodal queryClient is declared, useAuth is called for user then 3 useStates are used for caption, image, and preview; useEffect here is used to hide the modal when !isOpen which is true return don’t do anything so it gets hidden and handleKeyDown is used for onClose for accessibility and in cleanup function why the window keydown as to be cleared like I observed for addeventlistner cleanup is done why? And this useEffect takes place only when the dependencies isOpen and onClose values changes 
createPostMutation is declared where mutationfn calls createPost API  onSuccess queryClient.invalidateQueries({queryKey: [“feed”]}) explain this and toast is called and setCaption “” and setImage null and setPreview “” and onclose() onError shows the error toast 
handleImage function mainly shows the preview of the image to be uploaded where it gets the file and setImage as file and setPreview as URL createObjectURL(file) I get this 
handleSubmit this first checks if !image toast and return and in formData appends caption and image and creatPostMutation is called here by .mutate(formData) 

ProtectedRoute – useAuth() gets user and isAuthLoading from AuthContext. It does not validate the user itself. AuthInitializer calls getMe() to check authentication and updates user. Protected route shows Loader while checking, redirects to /login when no user exists, otherwise renders the protectedpage

PublicRoute – Uses the same auth state. Shows Loader while authentication is being checked. If user exists, redirects to / otherwise allow public pages like login/register 

6.	Axios instance – (axios.js) creates the main Axios instance with bseUrl, withCredentials, and a 10-second timeout; withCredentials allows the browser to send authentication cookies with requests. 

A separate refreshClient is used for /auth/refresh so the refresh request doesn’t go through the normal auth-refresh interceptor and cause recursion.

The response interceptor watches for 401 Unauthorized. A 401 trigger token refresh only when the request hasn’t been retried. isRefreshing ensures that when multiple requests get 401 simultaneously, only one refresh request is made while the others wait in failedQueue.

processQueue() releases waiting requests after refresh succeeds, or rejects them if refresh fails; _retry prevents infinite retry loops.

If refresh fails, triggerLogout() starts the global logout flow; isRefreshing is reset in finally.

7.	API files – API files contain function that represent backend API calls. They use the Axios instance to send HTTP requests to specific backend endpoints. They don’t contain UI logic; they provide functions such as loginUser(), getFeed(), createPost(), getUserProfile() that other frontend code can call.

8.	React Query – Used to manage server-state/API request handling in React. Axios makes the actual HTTP request; React Query manages the request state and gives the component things like data, isLoading, isError, isPending, onSuccess, and onError.

useQuery -> mainly used for reading/fetching server data.
useMutaion -> mainly used for creating/updating/deleting/changing server data.
QueryClient -> central manager for React Query; QueryClientProvider makes it available to the application.
React query caching -> Stores fetched server data in memory so it can be reused.
queryKey -> Unique identity of a query’s data.
staleTime -> How long fetched data is considered fresh.
Stale -> Data still exists, but may be outdated.
invalidateQueries -> This query’s data may be outdated.
Refetch -> Actually calls the  API again to get fresh data.
Clear -> Removes react query’s cached data.

9.	Custom hooks – useAuth() :- useAuth is custom hook used to access the global authentication from. AuthContext . The actual authentication check is performed by AuthInitializer through getMe(), which updates user and isAuthLoading in AuthProvider.

useLogout – A custom hook that manages the logout operation. It gets queryClient to clear React Query cache, navigate to redirect the user, and setUser from useAuth to remove the authenticated user from AuthContext.
It uses useMutation because logout is a server-side action that changes authentication state. Its mutationFn calls the logoutUser API.

useProfileNavigation – Custom hook that uses useNavigate() and useAuth() to provide a reusable goToProfile() function. It compares the targeted user ID with logged-in user’s ID. If they are the same, it navigates to /profile; otherwise it navigates to /profile/:userId.

useUpdateProfile – Custom hook that uses useMutation to update the user’s profile through the updateProfile API. 
•	On success: setUser(updatedUser) updates the logged-in user in AuthContext.
•	invalidateQueries([“feed”]) marks feed data stale so it can refresh with updated profile information.
•	Shows success toast.
•	onSuccessCallback?.() runs an optional callback, such as closing the edit-profile modal.
On error, it shows the backend error message or a default error toast.
useInfiniteFeed – useInfiniteQuery is used because the ORBIT  feed is paginated. It loads page by page instead of fetching everything at once.
When queryKey: [“feed”] identifies the feed query and queryfn: ({pageParam = 1}) => getFeed({page: pageParam, limit: PAGE_SIZE}) calls the API using the current page number; initialPageParam: 1 starts from page 1. 
getNextPageParam() check the backend’s page and totalPages. If another page exists, it returns the next page number; returning means there are no more pages. 
staleTime : data is considered fresh for n minutes.
gcTime : unused cached data can remain for up to n minutes before garbage collection.
refetchOnWindowFocus: false -> don’t automatically refetch the feed just because the browser window get focus.

useDeletePost.js – Uses useMutation to delete a post and performs an optimistic update.
onMutate cancels ongoing quries, saves the current cache as a backup, and immediately removes the post from feed/profile caches using setQueryData().
onError uses  the saved context to rollback the cache if the backend deletion fails. 
onSuccess shows success and runs an optional callback.
onSettled runs after both success and error and invalidates the affected queries so the frontend can synchronize with the backend.

useFollow.js – This is a custom hook that uses useMutaion to follow/unfollow a target user; targetUserId is the user being followed/unfollowed. mutationFn  checks that the ID exists and then calls the toggleFollow API.
onSuccess, related React Query queries are invalidated so their cached data becomes stale and active queries can refetch fresh data; profileUserId is used for the followers/following queries of the profile currently being viewed.
On error, it logs the error and shows an error toast.

useFollowers – Custom hooks using useQuery to fetch the followers of a user; queryKey: [”followers”, userId] uniquely identifies the followers query for that user; queryFn: () => getFollowers(userId) call the API to fetch followers; enabled: enabled && !!userId runs the query only when it is enabled and a userId exists. staleTime: 5 minutes means fetched follower data is considered fresh for 5 minutes.
Same implies to useFollowing also.
useDebounce – Custom hook that delays a changing value until it remains unchanged for a specified time. Useful in ORBIT search so the API’s is not called on every keystroke; setTimeOut() waits for the delay, and the cleanup clearTimeOut() cancels the previous timer whenever the value changes. 








  




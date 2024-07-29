// import { type RequestEvent } from "@sveltejs/kit";
import { Liveblocks } from "@liveblocks/node";
import { PUBLIC_LIVEBLOCKS_SECRET_KEY } from '$env/static/public';


const liveblocks = new Liveblocks({ secret: PUBLIC_LIVEBLOCKS_SECRET_KEY, });


export async function POST({ request }) {
  // Get the current user from your database
  //const user = __getUserFromDB__(request);

  const userID = Math.floor(Math.random() * 10) % USER_INFO.length;

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(`user-${userID}`, {
    userInfo: USER_INFO[userID],
  });

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  session.allow(`${user.organization}:*`, session.FULL_ACCESS);
  //session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}

const USER_INFO = [
  {
    name: "Arnav Surve",
    color: "#D583F0",
    email: "arnavsurve@gmail.com",
    organization: "nara",
    group: "producers"
  }
]

//async function __getUserFromDB__(request) {
//  // Extract user information from the request
//  const userID = request.headers.get('user-id');
//  // Fetch the user from your database
//  return {
//    id: userID,
//    organization: 'org-id',
//    group: 'group-id',
//    metadata: {
//      name: 'username',
//      email: 'johndoe@gmail.com'
//    },
//  };
//}

import {Webhook} from "svix";
import dbConnect from "@/config/configDB";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request) {
    const wh = new Webhook(process.env.SVIX_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
        "svix-signature": headerPayload.get("svix-signature"),
    };

    // Getting Here the Payload and Verifiy Process 

    const payload = await request.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    // Connecting to the Database
    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.profile_image_url,
    };
    await dbConnect();

    switch (type) {
        case 'user.created':
            await User.create(userData)
            break;

            case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData);
            break;

        case 'user.deleted':
            await User.findByIdAndDelete(data.id);
            break;

        default:
            break;
    }

    return NextRequest.json({
        message: "Webhook received and processed successfully",
        data: userData,
        type: type,
    })
}
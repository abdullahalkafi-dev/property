import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Property from './property.model';
import { fetchFromApi, getCustomerById } from './property.service';
import { User } from '../user/user.model';
import * as admin from 'firebase-admin';

export const newReservationAddHook = catchAsync(
  async (req: Request, res: Response) => {
    // const reqData = req.body;
    const reqData = {
      property: '183308',
      event: 'new_reservation',
      url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
      push_data: '{"reservation": 17024718}',
    };

    const pushData = JSON.parse(reqData.push_data);

    const reservationId = pushData.reservation;

    const reservationDetails = await fetchFromApi(
      'https://kapi.wubook.net/kp/reservations/fetch_one_reservation',
      new URLSearchParams({ id: reservationId })
    );
    console.dir(reservationDetails, { depth: Infinity });
    if (!reservationDetails) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Reservation not found',
      });
    }

    const rooms = reservationDetails?.data?.rooms;

    rooms.forEach(async (room: any) => {
      const zakRoomId = room.id_zak_room;
      const property = await Property.findOne({ zakRoomId });
      if (!property) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Property not found',
        });
      }
      const formattedData = {
        zakRoomId: zakRoomId,
        title: `🛎️${property.roomName}🛎️`,
        from: room.dfrom,
        to: room.dto,
        total: reservationDetails?.data?.price.total,
      };
      const ownerList = await Property.find({
        zakRoomId: zakRoomId,
      }).select('owner');

      // If no owners are found, return a 404 response
      if (ownerList.length === 0) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'No owners found for the specified room ID',
        });
      }

      //@ts-ignore
      // Emit the event to all owners
      const socketIo = global.io;
      ownerList.forEach(async owner => {
        const fcm = await User.findById(owner.owner).select('fcmToken');
        if (owner && owner.owner && fcm?.fcmToken) {
          console.log('owner token', fcm?.fcmToken);
          try {
            // Emit to the user's socket
            // socketIo.emit(`reservation-status-change:${owner.owner.toString()}`, {
            //   formattedData,
            // });
            if (
              fcm?.fcmToken === null ||
              fcm?.fcmToken === 'kafikafi1922@gmail.com'
            ) {
              console.log('fcm token is null');
              return;
            }
            const message = {
              token: fcm?.fcmToken, // Device FCM Token
              notification: {
                title: formattedData.title,
                body: `Ha recibido una NUEVA RESERVA - Desde: ${formattedData.from} hasta: ${formattedData.to}`, // Message
              },
              data: {
                extraData: 'Custom Data For User',
              },
            };

            await admin.messaging().send(message);
          } catch (error) {
            console.error(`Error emitting to user ${owner.owner}:`, error);
          }
        }
      });
    });
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservation status changed and notifications triggered',
      data: null,
    });
  }
);

export const reservationStatusChangeHook = catchAsync(
  async (req: Request, res: Response) => {
    // const data = {
    //   property: '183308',
    //   event: 'change_status',
    //   url: 'http://115.127.156.13:5002/api/v1/new-reservation-added-hook',
    //   push_data:
    //     '{"reservation": 21306358,"old_status": "confirmed","new_status": "cancelled"}',
    // };
    const data = req.body;
    const pushData = JSON.parse(data.push_data);
    //  console.log(pushData);
    const reservationId = pushData.reservation;
    const reservationDetails = await fetchFromApi(
      'https://kapi.wubook.net/kp/reservations/fetch_one_reservation',
      new URLSearchParams({ id: reservationId })
    );
    if (!reservationDetails) {
      return sendResponse(res, {
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Reservation not found',
      });
    }

    const rooms = reservationDetails?.data?.rooms;

    rooms.forEach(async (room: any) => {
      const zakRoomId = room.id_zak_room;
      const property = await Property.findOne({ zakRoomId });
      if (!property) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Property not found',
        });
      }
      const formattedData = {
        zakRoomId: zakRoomId,
        title: `🛎️${property.roomName}🛎️`,
        from: room.dfrom,
        to: room.dto,
      };
      const ownerList = await Property.find({
        zakRoomId: zakRoomId,
      }).select('owner');

      // If no owners are found, return a 404 response
      if (ownerList.length === 0) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'No owners found for the specified room ID',
        });
      }

      //@ts-ignore
      // Emit the event to all owners
      const socketIo = global.io;
      ownerList.forEach(async owner => {
        const fcm = await User.findById(owner.owner).select('fcmToken');
        if (owner && owner.owner && fcm?.fcmToken) {
          console.log('owner token', fcm?.fcmToken);
          try {
            // Emit to the user's socket
            // socketIo.emit(`reservation-status-change:${owner.owner.toString()}`, {
            //   formattedData,
            // });
            if (
              fcm?.fcmToken === null ||
              fcm?.fcmToken === 'kafikafi1922@gmail.com'
            ) {
              console.log('fcm token is null');
              return;
            }
            const message = {
              token: fcm?.fcmToken, // Device FCM Token
              notification: {
                title: formattedData.title,
                body: `El estado de su reserva ha cambiado a: ${reservationDetails?.data?.status.toUpperCase()} - Desde: ${formattedData.from} hasta: ${formattedData.to}`, // Message
              },
              data: {
                extraData: 'Custom Data For User',
              },
            };
            await admin.messaging().send(message);
          } catch (error) {
            console.error(`Error emitting to user ${owner.owner}:`, error);
          }
        }
      });
    });

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reservation status changed and notifications triggered',
      data: null,
    });
  }
);

import express from 'express';
import {
    extendMemberByPhone,
    getAllMembers,
    getMemberByPhone
} from '../controllers/member.controller.js';
const router = express.Router();

router.post('/extend/:phone', extendMemberByPhone);

router.get('/', getAllMembers);

router.get('/:phone', getMemberByPhone);

export default router;

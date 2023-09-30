import Member from '../models/member.model.js';

export const extendMemberByPhone = async (req, res) => {
    const phone = req.params.phone;
    const { duration } = req.body; // duration is in days

    try {
        if (duration < 1) {
            return res.status(400).json({
                message: 'Duration must be greater than or equal to 1'
            });
        }

        const member = await Member.findOne({ phone: phone });

        if (!member) {
            const renewalDate = new Date();

            const expiryDate = new Date(
                renewalDate.getTime() + duration * 24 * 60 * 60 * 1000
            );

            const newMember = new Member({
                phone: phone,
                renewalDate: renewalDate.toISOString(),
                expiryDate: expiryDate.toISOString()
            });

            await newMember.save();

            return res.status(201).json(newMember);
        }

        // Check if member has expired
        const renewalDate = new Date();
        const expiryDate = new Date(member.expiryDate);

        if (expiryDate.getTime() < Date.now()) {
            expiryDate.setTime(
                renewalDate.getTime() + duration * 24 * 60 * 60 * 1000
            );

            member.renewalDate = renewalDate.toISOString();
            member.expiryDate = expiryDate.toISOString();

            await member.save();

            return res.status(200).json(member);
        }

        // Member has not expired
        expiryDate.setTime(
            expiryDate.getTime() + duration * 24 * 60 * 60 * 1000
        );

        member.renewalDate = renewalDate.toISOString();
        member.expiryDate = expiryDate.toISOString();

        await member.save();

        return res.status(200).json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find();

        res.status(200).json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMemberByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        const member = await Member.findOne({
            phone: phone
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.status(200).json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

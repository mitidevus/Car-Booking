import { userList } from '../data/user'

export function accountValidator(user) {
    var userIndex = -1
    userIndex = userList.findIndex((u) => u.email === user.email)

    if (userIndex === -1)
        return null

    if (!userList[userIndex].password !== user.password)
        return null
    return userList[userIndex]
}

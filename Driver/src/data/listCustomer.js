import React, {useState} from "react"
export function copyListCustomer (list, data) {
    list = data
}
export function removeListCustomer (list,data) {
    list.filter(target => target.userId !== data.userId)
}
export default ListCustomer = []
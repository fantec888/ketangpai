package com.cqut.ktp.service;

import com.cqut.ktp.pojo.Message;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author 欧阳建荣
 */
public interface MessageService {
    /**
     * 查询未阅读数量
     *
     * @param to 接收方
     * @return integer
     */
    Integer getNotReadMsgCount(String to);

    /**
     * 查询接收方的消息，可以是所有，也可以是未读和已读
     *
     * @param to
     * @param status 为空或者-1就是读取所有消息
     * @return 一个消息列表
     */
    List<Message> getMessages(String to, Integer status);

    /**
     * 获取双方会话消息
     *
     * @param uid  当前用户
     * @param peer 对方用户
     * @return 会话消息
     */
    List<Message> getConversation(String uid, String peer);

    /**
     * 发送消息
     *
     * @param message
     * @return 无异常就返回true
     */
    Boolean send(Message message);

    /**
     * 阅读未读消息
     *
     * @param msgIds
     * @return 无异常便返回true
     */
    Boolean read(List<String> msgIds);

    /**
     * 将某个会话中的未读消息设为已读
     *
     * @param uid  当前用户
     * @param peer 对方用户
     * @return true 表示成功
     */
    Boolean readConversation(String uid, String peer);
}

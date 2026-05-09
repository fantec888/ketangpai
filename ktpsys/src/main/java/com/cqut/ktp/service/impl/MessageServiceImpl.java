package com.cqut.ktp.service.impl;

import com.cqut.ktp.mapper.MessageMapper;
import com.cqut.ktp.pojo.Message;
import com.cqut.ktp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.List;

/**
 * @author 欧阳建荣
 */
@Service
public class MessageServiceImpl implements MessageService {
    @Autowired
    private MessageMapper mapper;

    @Override
    public Integer getNotReadMsgCount(String to) {
        return mapper.getNotReadMsgCount(to);
    }

    @Override
    public List<Message> getMessages(String to, Integer status) {
        return mapper.getMessages(to, status);
    }

    @Override
    public List<Message> getConversation(String uid, String peer) {
        return mapper.getConversation(uid, peer);
    }

    @Override
    public Boolean send(Message message) {
        try {
            message.setStatus(0);
            mapper.send(message);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean read(List<String> msgIds) {
        Object savePoint = null;

        try {
            // 设置回滚点
            savePoint = TransactionAspectSupport.currentTransactionStatus().createSavepoint();

            mapper.read(msgIds);

            return true;
        } catch (Exception e) {
            // 保存失败的时候回滚事件
            assert savePoint != null;
            TransactionAspectSupport.currentTransactionStatus().rollbackToSavepoint(savePoint);
            return false;
        }
    }

    @Override
    public Boolean readConversation(String uid, String peer) {
        try {
            mapper.readConversation(uid, peer);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'auth\input.ui'
#
# Created by: PyQt5 UI code generator 5.14.2
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_Form(object):
    def setupUi(self, Form):
        Form.setObjectName("Form")
        Form.resize(300, 40)
        self.textbox = QtWidgets.QLineEdit(Form)
        self.textbox.setGeometry(QtCore.QRect(110, 5, 181, 30))
        font = QtGui.QFont()
        font.setFamily("SF Pro Display")
        font.setPointSize(10)
        self.textbox.setFont(font)
        self.textbox.setStyleSheet("QLineEdit {\n"
"    background-color: #332929;\n"
"    padding: 0 3px;\n"
"}")
        self.textbox.setFrame(False)
        self.textbox.setObjectName("textbox")
        self.label = QtWidgets.QLabel(Form)
        self.label.setGeometry(QtCore.QRect(10, 5, 101, 30))
        font = QtGui.QFont()
        font.setFamily("SF Pro Display")
        font.setPointSize(11)
        self.label.setFont(font)
        self.label.setObjectName("label")

        self.retranslateUi(Form)
        QtCore.QMetaObject.connectSlotsByName(Form)

    def retranslateUi(self, Form):
        _translate = QtCore.QCoreApplication.translate
        Form.setWindowTitle(_translate("Form", "Form"))
        self.label.setText(_translate("Form", "Redirect URI"))

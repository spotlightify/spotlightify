from multiprocessing import Process, Queue
from PyQt5.QtWidgets import QWidget


class UICollection:
    def __init__(self):
        self.collection = {}

    def add(self, name: str, ui: QWidget):
        self.collection[name] = ui


class UIEvent:
    def __init__(self, ui: str, event: bool):
        self._ui = ui  # the string name of a UI (spotlight, auth, settings)
        self._event = event  # event: the action to perform (open, close)

    @property
    def ui(self):
        return self._ui

    @property
    def event(self):
        return self._event


class UIEventQueue(Queue):
    def __init__(self):
        Queue.__init__(self)

    def push(self, ui_event: UIEvent):
        self.put(ui_event)

    def pull(self) -> UIEvent:
        event = self.get()
        if not isinstance(event, UIEvent):
            return None

        return event


class UIThread(Process):
    def __init__(self, ui: QWidget):
        Process.__init__(self)
        self.ui = ui


class UIManager(Process):
    def __init__(self, event_queue: UIEventQueue, ui_collection: UICollection):
        Process.__init__(self)
        self.event_queue = event_queue
        self.collection = ui_collection

    def run(self) -> None:
        while True:
            try:
                while not self.event_queue.empty():
                    event = self.event_queue.pull()

                    # if event is not None:


            except Exception as ex:
                print(ex)

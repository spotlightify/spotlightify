from multiprocessing import Process, Queue
from time import sleep
from datetime import datetime
from PyQt5.QtWidgets import QWidget


class UIEvent:
    def __init__(self, ui: str, event: bool):
        self._ui = ui  # the string name of a UI (spotlight, auth, settings)
        self._event = event  # event: the action to perform (show, hide)

    @property
    def ui(self):
        return self._ui

    @property
    def event(self):
        return self._event


class UIEventQueue:
    def __init__(self):
        self._queue = Queue()

    def show(self, ui: str):
        self._queue.put(UIEvent(ui, True))

    def hide(self, ui: str):
        self._queue.put(UIEvent(ui, False))

    def empty(self):
        return self._queue.empty()

    def get(self):
        event = self._queue.get()
        if not isinstance(event, UIEvent):
            return None
        return event


class UIThread(Process):
    def __init__(self, ui: QWidget, queue: Queue):
        Process.__init__(self)

        self._ui = ui
        self._queue = queue

        self.start()

    def run(self) -> None:
        while True:
            event = self._queue.get(True)
            print(datetime.now(), event)


class UIManager(Process):
    def __init__(self, queue: UIEventQueue):
        Process.__init__(self)

        self.event_queue = queue
        self.threads = {}

        self.start()

    def run(self) -> None:
        while True:
            if not self.event_queue.empty():
                e = self.event_queue.get()
                # if e is not None:

            sleep(0.25)

    def add(self, name: str, ui: QWidget):
        queue = Queue()
        self.threads[name] = {
            "thread": UIThread(ui, queue),
            "queue": queue
        }

        print(self.threads)

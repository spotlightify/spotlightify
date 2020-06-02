from queue import Queue


class ImageQueue(Queue):
    def put_image(self, file, url):
        self.put({"file": file, "url": url})


class SongQueue(Queue):
    def put_songs(self, data):
        if not isinstance(data, list):
            data = [data]
        self.put(data)

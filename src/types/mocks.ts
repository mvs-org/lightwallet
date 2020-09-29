import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

export class MockStorage extends Storage {
    private db: any = {}
    get(key) {
        return Promise.resolve(this.db[key])
    }
    set(key, value) {
        this.db[key] = value;
        return Promise.resolve()
    }
}

export class MockEvents extends Events {
    wasPublished=false
    subscribe(name, callback){}
    publish(topic: string, ...args: any[])  {
        this.wasPublished = true
        return []
    }
    published(){return this.wasPublished}
}

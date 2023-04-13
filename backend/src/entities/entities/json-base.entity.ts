import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JsonBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    genericField: string;

    // Column with JSON data type
    @Column('simple-json', {nullable: true})
    otherInfo: {
        description: string;
        freeShipping: boolean;
        weight: number;
        color: string;
    };
}